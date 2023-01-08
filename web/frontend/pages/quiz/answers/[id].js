import { useFindOne, useFindMany } from "@gadgetinc/react";
import { Page, Button, Card, Layout, Stack } from "@shopify/polaris";
import { useRouter } from "next/router";
import { QuestionAnswerForm } from "../../../components/QuestionAnswerForm.js";
import { MappedQuizAnswers } from "../../../components/MappedQuizAnswers.js";
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

export default function Answers() {
  const router = useRouter();

  const quizId = router.query.id;
  const [quiz, refresh] = useFindOne(api.quiz, quizId, {
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
                  description: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const currentQuiz = quiz.data;
  if (currentQuiz) {
    const currentQuestions = currentQuiz.questions.edges;
    console.log(currentQuestions);

    const quizTitle = currentQuiz.title;

    currentQuestions.sort((a, b) => a.node.sequence - b.node.sequence);

    let mappedAnswers = currentQuestions.filter((r) => {
      return r.node.answers.edges.length != 0;
    });

    const unmappedCurrentAnswers = currentQuestions.filter(
      (r) => r.node.answers.edges.length === 0
    );

    return (
      <Page
        title={`Product Recommendation Quiz Machine - Create a Quiz`}
        divider
      >
        <Layout>
          <Layout.Section>
            <Card
              sectioned
              title={`Add answers to questions for the ` + quizTitle + ` quiz.`}
            >
              {currentQuiz &&
                currentQuestions &&
                unmappedCurrentAnswers.map((q) => {
                  return (
                    <QuestionAnswerForm
                      key={q.node.id}
                      question={q.node}
                      refresh={refresh}
                    />
                  );
                })}
            </Card>
          </Layout.Section>
          <Layout.Section>
            {mappedAnswers && (
              <Card sectioned title={`Currently mapped answers`}>
                <MappedQuizAnswers mappedAnswers={mappedAnswers} />
              </Card>
            )}
          </Layout.Section>
          <Layout.Section>
            <Card title={"Add results and map quiz"}>
              <Layout.Section>
                <Button
                  onClick={() => router.push(`/quiz/mapping/${currentQuiz.id}`)}
                >
                  On to adding results!
                </Button>
              </Layout.Section>
              <br />
            </Card>
            <br />
          </Layout.Section>
        </Layout>
      </Page>
    );
  } else {
    return (
      <Layout>
        <Layout.Section>
          <Card title="There was an issue fetching the current quiz." />
        </Layout.Section>
      </Layout>
    );
  }
}
