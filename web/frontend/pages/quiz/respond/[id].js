import { useAction, useFindOne, useFindMany } from "@gadgetinc/react";
import { Button, Card, Frame, Layout, Page, Stack } from "@shopify/polaris";
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "./../../../api.js";
import { QuestionCard } from "../../../components/QuestionCard.js";
import _ from "lodash";

// Generates `/posts/1` and `/posts/2`
// export async function getStaticPaths() {
//   // Call an external API endpoint to get posts
//   const data = useFindMany(api.quiz, {
//     select: { id: true, title: true, body: true },
//   });

//   // Get the paths we want to prerender based on posts
//   // In production environments, prerender all pages
//   // (slower builds, but faster initial page load)
//   const paths = data.map((quiz) => ({
//     params: { id: quiz.id },
//   }));

//   return {
//     paths,
//     fallback: false, // can also be true or 'blocking'
//   };
// }

// // `getStaticPaths` requires using `getStaticProps`
// export async function getStaticProps(context) {
//   const { params } = context;

//   const data = useFindOne(api.quiz, params.id, {
//     select: { id: true, title: true, body: true },
//   });
//   return {
//     // Passed to the page component as props
//     props: { post },
//   };
// }

export default function Respond() {
  const [result, setResult] = useState([]);
  const [errors, setErrors] = useState(null);
  const [responseAnswers, setResponseAnswers] = useState([]);

  const urlRouter = useRouter();

  console.log(urlRouter.query.id);

  const quiz = useFindOne(api.quiz, parseInt(urlRouter.query.id), {
    select: {
      id: true,
      title: true,
      body: true,
      questions: {
        edges: {
          node: {
            id: true,
            title: true,
            body: true,
            sequence: true,
            imageUrl: true,
            answers: {
              edges: {
                node: {
                  id: true,
                  text: true,
                  sequence: true,
                },
              },
            },
          },
        },
      },
      results: {
        edges: {
          node: {
            id: true,
            body: true,
            imageUrl: true,
            productSuggestion: {
              id: true,
              title: true,
            },
            answers: {
              edges: {
                node: {
                  id: true,
                  text: true,
                  sequence: true,
                  question: {
                    title: true,
                    sequence: true,
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  const [_createResponseActionResult, createResponse] = useAction(
    api.response.create,
    {
      select: {
        id: true,
        conversionState: true,
        answers: { edges: { node: { id: true, result: { id: true } } } },
      },
    }
  );

  const [createdResponse, setCreatedResponse] = useState(null);

  const currentQuiz = quiz[0].data;

  const handleStartResponse = async (event) => {
    event.preventDefault();

    const _result = await createResponse({
      response: {
        conversionState: "in progress",
      },
    });

    console.log(`Create response result:`, _result);
    if (_result.data) {
      setCreatedResponse(_result.data);
    } else if (_result.error) {
      setErrors(_result.error);
    }
  };

  const handleResponseSubmitted = (event) => {
    event.preventDefault();
    responseAnswers = [...new Set(responseAnswers)];
    Promise.all(
      responseAnswers.map((a) => {
        return api.answer
          .update(
            parseInt(a.node.id),
            {
              answer: {
                response: {
                  _link: createdResponse.id,
                },
              },
            },
            {
              select: {
                id: true,
                result: {
                  id: true,
                },
                response: {
                  id: true,
                  conversionState: true,
                  quiz: { id: true },
                },
              },
            }
          )
          .then((result) => {
            console.log(`Update Answers result:`, result);
            setResult(result);
          })
          .catch((error) => {
            console.log(`Update Answers error:`, error);
            setErrors(error);
          });
      })
    );
    updateResponse(createdResponse.id);
  };

  async function updateResponse(_responseId) {
    await api.response
      .update(
        parseInt(_responseId),
        {
          response: {
            quiz: {
              _link: currentQuiz.id,
            },
            conversionState: "quiz completed",
          },
        },
        {
          select: {
            id: true,
            quiz: { id: true, title: true },
            conversionState: true,
          },
        }
      )
      .then((result) => {
        console.log(`Updated Response: ` + result);
        setCreatedResponse(result);
        urlRouter.push(`/quiz/result/${_responseId}`);
      });
  }

  if (currentQuiz) {
    const questions = currentQuiz.questions.edges;

    return (
      <>
        <Head>
          <title>{currentQuiz.title}</title>
        </Head>
        <>
          <Frame>
            <Page title={currentQuiz.title}>
              <Layout>
                <Layout.Section>
                  <Stack vertical>
                    <Stack.Item>
                      <Card title={currentQuiz.title}>
                        <br />
                        <Layout.Section>{currentQuiz.body}</Layout.Section>
                        {!createdResponse && (
                          <Layout.Section>
                            <Button onClick={handleStartResponse} primary>
                              Start the quiz!
                            </Button>
                          </Layout.Section>
                        )}
                        <br />
                      </Card>
                    </Stack.Item>
                    {createdResponse &&
                      createdResponse.conversionState == "in progress" &&
                      questions.map((q) => {
                        return (
                          <QuestionCard
                            key={q.node.id}
                            question={q.node}
                            response={createdResponse}
                            responseAnswers={responseAnswers}
                          />
                        );
                      })}
                    <Stack.Item>
                      {createdResponse &&
                        createdResponse.conversionState == "in progress" && (
                          <Card title={`Submit Quiz`}>
                            <Layout.Section>
                              <Button onClick={handleResponseSubmitted} primary>
                                Get my result!
                              </Button>
                            </Layout.Section>
                          </Card>
                        )}
                    </Stack.Item>
                  </Stack>
                </Layout.Section>
              </Layout>
            </Page>
          </Frame>
        </>
      </>
    );
  } else {
    return (
      <>
        <Head>
          <title>{`Quiz loading`}</title>
        </Head>
        <>
          <Frame>
            <Page title={`Quiz loading...`}>
              <Layout></Layout>
            </Page>
          </Frame>
        </>
      </>
    );
  }
}
