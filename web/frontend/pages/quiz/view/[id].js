import { useFindOne, useFindMany } from "@gadgetinc/react";
import { Card, Frame, Layout, Page, Stack, Button } from "@shopify/polaris";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "./../../../api.js";

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
//   return {
//     // Passed to the page component as props
//     props: { post: {} },
//   };
// }

export default function View() {
  const urlRouter = useRouter();

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

  const currentQuiz = quiz[0].data;

  if (currentQuiz) {
    const responseUrl = `/quiz/respond/${currentQuiz.id}`;
    return (
      <>
        <Head>
          <title>{currentQuiz.title}</title>
        </Head>
        <>
          <Frame>
            <Page
              title={currentQuiz.title}
              divider
              primaryAction={
                <Button primary onClick={() => urlRouter.push(responseUrl)}>
                  Take the quiz!
                </Button>
              }
            >
              <Layout>
                <Layout.Section>
                  <Stack vertical>
                    <Stack.Item>
                      <Card title={`What is this quiz for?`}>
                        <br />
                        <Layout.Section>{currentQuiz.body}</Layout.Section>
                        <br />
                      </Card>
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
          <title>{`Loading`}</title>
        </Head>
        <>
          <Frame>
            <Page title={`Loading`} divider>
              <Layout>
                <Layout.Section></Layout.Section>
              </Layout>
            </Page>
          </Frame>
        </>
      </>
    );
  }
}
