import { useFindOne, useFindMany } from "@gadgetinc/react";
import { Button, Card, Layout, Stack, Page, Banner } from "@shopify/polaris";
import { useRouter } from "next/router";
import { api } from "./../../../api.js";
import { CreateResultMappings } from "../../../components/CreateResultMappings.js";
import { MappedQuizResults } from "../../../components/MappedQuizResults.js";
import { CreateResults } from "../../../components/CreateResults.js";
import _ from "lodash";

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

export default function Mapping() {
  const router = useRouter();

  console.log(router.query.id);
  const quiz = useFindOne(api.quiz, parseInt(router.query.id), {
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

  // Products
  const products = [];
  const fetchedProducts = api.shopifyProduct
    .findMany({
      first: 250,
      //search: "bundle",
      select: {
        id: true,
        title: true,
        variants: {
          edges: {
            node: {
              id: true,
              title: true,
              price: true,
              results: {
                edges: {
                  node: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    .then((result) => {
      console.log(result);
      result.flatMap((p) => {
        products.push(p);
      });
    });

  let currentQuiz = quiz[0].data;

  if (currentQuiz) {
    const quizTitle = currentQuiz.title;
    const currentResults = [];

    if (currentQuiz.results.edges.length > 0) {
      currentQuiz.results.edges.flatMap((r) => {
        currentResults.push(r.node);
      });
      currentResults.sort((a, b) => a.id - b.id);
    }

    let mappedResults = currentResults.filter((r) => {
      return r.answers.edges.length != 0;
    });

    return (
      <Page
        title={`Product Recommendation Quiz Machine - Create a Quiz`}
        divider
      >
        <Layout>
          <Layout.Section>
            <CreateResults quiz={currentQuiz} products={products} />
          </Layout.Section>
          <Layout.Section>
            {currentResults ? (
              <Card
                sectioned
                title={`Map answers to results for the ${quizTitle} quiz.`}
              >
                <CreateResultMappings
                  currentResults={currentResults}
                  currentQuiz={currentQuiz}
                />
              </Card>
            ) : (
              <Banner
                title="Your shipping label is ready to print."
                status="success"
                action={{ content: "Print label" }}
                onDismiss={() => {}}
              />
            )}
          </Layout.Section>
          <Layout.Section>
            {mappedResults && (
              <Card sectioned title={`Currently mapped results`}>
                <MappedQuizResults mappedResults={mappedResults} />
              </Card>
            )}
          </Layout.Section>
          <Layout.Section>
            {currentResults && (
              <Card title={`View completed quiz`}>
                <Layout.Section>
                  <Stack>
                    <Button
                      onClick={() =>
                        router.push(`/quiz/view/${currentQuiz.id}`)
                      }
                    >
                      View quiz
                    </Button>
                  </Stack>
                  <br />
                </Layout.Section>
              </Card>
            )}
            <br />
          </Layout.Section>
        </Layout>
      </Page>
    );
  } else {
    return (
      <Layout>
        <Layout.Section>
          <Card title={`There was an issue fetching the current quiz.`}></Card>
        </Layout.Section>
      </Layout>
    );
  }
}
