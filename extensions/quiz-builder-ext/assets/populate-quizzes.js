//call the fetch function
async function fetchAllQuizzes() {
  const quizzes = await GadgetClient.query(`query FindManyQuizzes {
        quizzes {
          edges {
            node {
              __typename
              id
              state
              # ...
              createdAt
              updatedAt
            }
          }
        }
      }
    `);
  return quizzes;
}

fetchAllQuizzes().then(function (quizzes) {
  const options = [];
  quizzes.map((quiz) => {
    options.push({
      label: quiz.title,
      value: quiz.id,
    });
  });
});
