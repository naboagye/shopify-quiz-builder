async function loading() {
  let g = await import(
    "https://curlsfusion-hair-quiz.gadget.app/api/client/web.min.js"
  );
  window.GadgetClient = new Gadget({
    authenticationMode: { apiKey: "gsk-8PYUwygVTyfmFH3pZc4WqprRnXjjPFc9" },
  });
}

async function updateAnswers(answers, response) {
  const updatedAnswers = await answers.forEach((answer) => {
    GadgetClient.mutate(
      `
               mutation($id: GadgetID!, $answer: UpdateAnswerInput) {
                 updateAnswer(id: $id, answer: $answer) {
                   success
                   answer {
                     id
                     response {
                       id
                       state
                       conversionState
                       createdAt
                       email
                       result {
                         id
                         state
                         body
                         createdAt
                         imageUrl
                         productSuggestion {
                           id
                           price
                           title
                         }
                         quiz {
                           id
                           state
                           body
                           createdAt
                           title
                           updatedAt
                         }
                         updatedAt
                       }
                     }
                     sequence
                     text
                   }
                 }
       }`,
      {
        id: answer,
        answer: {
          response: {
            _link: response.id,
          },
        },
      }
    );
  });

  return updatedAnswers;
}

async function createResponse(quiz) {
  const Quiz = quiz.quiz;
  const response = await GadgetClient.mutate(
    `
   mutation ( $response: CreateResponseInput) { createResponse(response: $response) {
       success
       errors {
         message
         ... on InvalidRecordError {
           validationErrors {
             apiIdentifier
             message
           }
         }
       }
       response {
         __typename
         id
         state
         answers {
           edges {
             node {
               id
               state
               createdAt
               question {
                 id
                 state
                 body
                 createdAt
                 imageUrl
                 required
                 sequence
                 title
                 updatedAt
               }
             }
           }
         }
         conversionState
         createdAt
         email
         quiz {
           id
           state
           body
           createdAt
           title
           updatedAt
         }
         updatedAt
       }
     }
   }
 `,
    { response: { quiz: { _link: Quiz.id }, conversionState: "in progress" } }
  );
  return response;
}

async function updateResponse(response) {
  const updatedResponse = await GadgetClient.mutate(
    `mutation ($id: GadgetID!, $response: UpdateResponseInput) {
   updateResponse(id: $id, response: $response) {
     success
     errors {
       message
       ... on InvalidRecordError {
         validationErrors {
           apiIdentifier
           message
         }
       }
     }
     response {
       __typename
       id
       state
    
       conversionState
       createdAt
       email
       quiz {
         id
         state
         body
         createdAt
         title
         updatedAt
       }
       result {
         id
         state
         body
         createdAt
         imageUrl
         productSuggestion {
           id
           price
           title
       product {
               title
               handle
         body
               images {
               edges {
                   node {
                       source
                       }
                     }
                   }
                 }
               }
         quiz {
           id
           state
           body
           createdAt
           title
           updatedAt
         }
         updatedAt
       }
       updatedAt
     }
   }
 }
 `,
    { id: response.id, response: { conversionState: "quiz completed" } }
  );
  return updatedResponse;
}

async function fetchQuiz() {
  const go = await loading();
  const quizid = document.getElementById("quizid").value;
  const quiz = await GadgetClient.query(`query getOneQuiz {
 quiz (id: ${quizid}) {
   id,
   title,
   body,
   questions {
       edges {
       node {
         id,
       title,
       body,
       imageUrl,
       required,
       sequence,
       answers {
         edges {
           node {
             id,
             text,
             sequence,
             question {
               id,
               },
             },
           },
         },
         },
       },
   },
   results {
       edges {
         node {
           id,
           state,
           body,
           imageUrl,
           productSuggestion {
                   id,
                   price,
                   title,
             product {
             title,
             handle,
             },
                 },
         },
       },
     },
   },
 }`);

  return quiz;
}
let answerLimit = [1,1,1,1,1,3,1,1]
function getAnswerlimit(questionNumber){
    let limit = answerLimit[questionNumber]
    console.log("limit" + limit)
    return limit
  }

function getNumberOfCheckedAnswers(questionNumber){
  console.log(document.getElementsByClassName("q"+ questionNumber + "_answer"))

  let answers = Array.from(document.getElementsByClassName("q"+ questionNumber + "_answer"))
  console.log("answers: " + answers)
  console.log("is the first answer checked: " + answers[0].children[0].children[0].checked )
  let checkedAnswers = answers.filter(answer => answer.children[0].children[0].checked == true)
  console.log("CheckedAnswers:" + checkedAnswers)
  let numberOfCheckedAnswers =  checkedAnswers.reduce((num_elements,element) => num_elements += 1, 0);
  console.log("number of checked Answers" +  numberOfCheckedAnswers)
  return numberOfCheckedAnswers
}

function disableRemainingAnswers(questionNumber){
  console.log("disable remaining answers called")
  all_checkboxes = Array.from(document.getElementsByClassName("answer_checkbox"))
  console.log(all_checkboxes[0].value)
  
  checkboxes_for_question = all_checkboxes.filter(checkbox => checkbox.value == questionNumber)
  console.log("checkboxes: " + checkboxes_for_question)
  checkboxes_for_question.forEach(item => {
    if(item.checked == false) {
        item.disabled = true
        item.parentElement.parentElement.classList.add("disabled_answer")
        console.log(item.parentElement.parentElement)
        }
    }    
);
}


loading();
let selectedAnswers = [];

function unselectAnswer(answer, questionNumber) {
  selectedAnswers.splice(selectedAnswers.indexOf(answer),1)
  //implement unselect answer
  // you unselect an answer if an answer is already present when you go to run select answer 
  enableAnswers(questionNumber)

}

function enableAnswers(questionNumber){
  console.log("enable answers called")
  all_checkboxes = Array.from(document.getElementsByClassName("answer_checkbox"))
  checkboxes_for_question = all_checkboxes.filter(checkbox => checkbox.value == questionNumber)
  for (checkbox in checkboxes_for_question.disabled){
      if(checkbox.disabled == true){
        checkbox.disabled = false
      }
  }
}

function selectAnswer(answer, questionNumber, elementId) {

  console.log("selectAnswer called")
  answerElement = document.getElementById(elementId);
  console.log(answerElement)
  answerElement.classList.add("selected-answer");
  

  //first check that the answer is not already selected and should be unselected.
  console.log(answer)
  console.log(selectedAnswers)

  if(selectedAnswers.indexOf(answer) != -1){
    console.log("answer if already selected")
    unselectAnswer(answer,questionNumber)
  }
  else if(getAnswerlimit(questionNumber) <= 1)
  { 
    selectedAnswers.push(answer);
    disableRemainingAnswers(questionNumber)
    
    // let elId = event.srcElement.id;
    // answerElement = document.getElementById(elId);
    // answerChild = answerElement.children[0];
    // answerNestedChild = answerChild.children[0];
    // answerNestedChild.classList.add("selected-answer");
    // let parent = document.getElementById(elId).parentNode;
    // parent.innerHTML = "<h3>Answer selected</h3>";
    
  }
  else {
    console.log(getAnswerlimit(questionNumber))
  }
}

fetchQuiz().then(function (quiz) {
  const quizData = quiz.quiz;
  const questions = quizData.questions.edges;

  if (!customElements.get("product-quiz")) {
    customElements.define(
      "product-quiz",
      class ProductQuiz extends HTMLElement {
        constructor() {
          super();

          this.form = this.querySelector("form");
          this.heading = this.querySelector("form h2");
          this.heading.innerHTML = quizData.title;
          this.body = this.querySelector(".product-quiz__body span");
          this.body.innerHTML = quizData.body;
          this.questions = this.querySelector(".slideshow-container");
          const questionContainer = this.querySelector(".mySlides");
          const answerContainer = this.querySelector(
            ".product-quiz__question-answer"
          );
          const submitContainer = this.querySelector(".product-body");
          const slideDots = this.querySelector(".slide-dots");

          submitContainer.innerHTML = "";

          // questions.forEach((question,i) => {
          //   slideDots.insertAdjacentHTML(
          //     "beforeend",
          //     '<span class="dot" onclick="currentSlide(' +
          //       (i + 1) +
          //       '}`)"></span>'
          //   );
          // });

          for (let i = 1; i <= questions.length; i++) {
            slideDots.insertAdjacentHTML(
              "beforeend",
              `<span class="dot" onclick="currentSlide(${i})"></span>`
            );
          }

          let renderedQuestions = questions
            .sort((a, b) => a.node.sequence - b.node.sequence)
            .forEach((question, i) => {
              let clonedDiv = questionContainer.cloneNode(true);
              clonedDiv.id = "question_" + i;
              clonedDiv.insertAdjacentHTML(
                "beforeend",
                "<div class='question-text'><h1>" +
                  question.node.title +
                  "</h1><h4>" +
                  question.node.body +
                  "</h4><br/></div>"
              );
              clonedDiv.insertAdjacentHTML(
                "beforeend",
                '<div class="product-quiz__question-answers"></div><button type="submit" class="product-quiz__submit button button--secondary">SHOW RESULTS</button>'
              );
              this.questions.appendChild(clonedDiv);

              // let answers = [...new Set(question.node.answers.edges.text)];
              let answers = question.node.answers.edges.filter(
                (value, index, self) =>
                  self.findIndex((v) => v.node.text === value.node.text) ===
                  index
              );
              answers
                .sort((a, b) => b.node.sequence - a.node.sequence)
                .forEach((answer, j) => {
                  let clonedSpan = answerContainer.cloneNode(true);
                  clonedSpan.id = "answer_" + i + "_" + j;
                  clonedSpan.insertAdjacentHTML(
                    "beforeend",
                    `<div class = "answers_checkbox answer cat action q${i}_answer" id="${clonedSpan.id}" onClick=(selectAnswer(${answer.node.id},${i},this.id)) >
                      <label>
                        <input class="answer_checkbox" type="checkbox" value=${i}>
                          <span>
                            <a>${answer.node.text}</a>
                          </span>
                      </label>
                    <div>
                    <br/>
                    <br/>`
                  );
                  clonedDiv.children[4].appendChild(clonedSpan);
                });
            });

          this.questions.removeChild(this.questions.children[0]);

          this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
        }

        onSubmitHandler(evt) {
          evt.preventDefault();

          const submitButton = this.querySelector(".product-quiz__submit");

          submitButton.setAttribute("disabled", true);
          submitButton.classList.add("loading");

          createResponse(quiz).then(function (response) {
            const currentResponse = response.createResponse.response;

            updateAnswers(selectedAnswers, currentResponse).then(function (
              results
            ) {
              updateResponse(currentResponse).then(function (updatedResponse) {
                const finalResponse = updatedResponse.updateResponse.response;

                if (finalResponse) {
                  const result = finalResponse.result;

                  if (result) {
                    const imgUrl =
                      result.productSuggestion.product.images.edges[0].node
                        .source;
                    const productLink = result.productSuggestion.product.handle;
                    const resultHTML =
                      `<div><h3>` +
                      result.body +
                      " - " +
                      result.productSuggestion.product.title +
                      `</h3><br/><p><img src=` +
                      imgUrl +
                      ` width="50%" height="50%"/><br/> <p>` +
                      result.productSuggestion.product.body +
                      `</p></br><a class="button" href="/products/` +
                      productLink +
                      `">Check it out!</a></div>`;
                    document.getElementById("questions").innerHTML = resultHTML;
                    submitButton.classList.remove("loading");
                    submitButton.classList.add("hidden");
                  }
                }
              });
            });
          });
        }
      }
    );
  }
});
