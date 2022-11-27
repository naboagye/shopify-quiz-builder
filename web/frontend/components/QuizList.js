import { useFindMany } from "@gadgetinc/react";
import { Button, Card, Stack, Tag, Icon } from "@shopify/polaris";
import { HashtagMinor } from "@shopify/polaris-icons";
import router from "next/router";
import { useState } from "react";
import { api } from "./../api.js";

export const QuizList = () => {
  const [{ data, fetching, error }, refresh] = useFindMany(api.quiz, {
    select: { id: true, title: true, body: true },
  });

  const [isDeleting, setIsDeleting] = useState([]);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState([]);

  const IDTag = (props) => {
    return (
      <Tag url="/collections/wholesale">
        <Stack spacing="extraTight">
          <Icon source={HashtagMinor} />
          <span>ID: {props.num}</span>
        </Stack>
      </Tag>
    );
  };

  if (error) return <p>Error: {error.message}</p>;
  if (fetching && !data) return <p>Fetching quizzes...</p>;
  if (!data || !data.length)
    return (
      <Card
        subdued
        sectioned
        title="No quizzes created yet!"
        primaryAction={{
          content: "Add A Quiz",
          url: "/create",
        }}
      >
        <p>Create a quiz to see it listed here.</p>
      </Card>
    );
  return (
    <Card>
      {data.map((quiz) => (
        <Card.Section
          key={quiz.id}
          title={quiz.title || "Unnamed quiz"}
          secondaryFooterActions={[
            { content: "Cancel shipment", destructive: true },
          ]}
          primaryFooterAction={{ content: "Add tracking number" }}
        >
          <IDTag num={quiz.id} />
          <p>{quiz.body || "No description set"}</p>
          <Button onClick={() => router.push(`/quiz/view/${quiz.id}`)}>
            View
          </Button>
          <Button
            destructive
            disabled={deleteErrorMessage.find((m) => m.id === quiz.id)}
            loading={isDeleting.includes(quiz.id)}
            onClick={() => {
              setIsDeleting([...isDeleting, quiz.id]);
              api.quiz
                .delete(quiz.id)
                .then(() => refresh())
                .catch((error) => {
                  console.log("Error deleting quiz: ", error);
                  setDeleteErrorMessage([
                    ...deleteErrorMessage.filter((m) => m.id !== quiz.id),
                    {
                      id: quiz.id,
                      message: Object.keys(error)
                        ? JSON.stringify(error)
                        : error,
                    },
                  ]);
                })
                .finally(() =>
                  setIsDeleting(isDeleting.filter((d) => d !== quiz.id))
                );
            }}
          >
            Delete
          </Button>
        </Card.Section>
      ))}
    </Card>
  );
};
