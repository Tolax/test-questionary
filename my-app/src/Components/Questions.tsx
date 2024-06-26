import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { count, counterRightAnwsers, countEasy, countMedium, countHard } from './store/actions';
import "./styles.css";
import Results from './Results';
import loadIcon from '../icons/round_12906744.png';
import { StyledButton } from './Styled-components/Button';

interface Question {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string | string[];
  incorrect_answers: string[];
  allAnswers: string[];
  allRightAnswers: string[];
}

export default function Questions() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  const resseter = () =>{
    setUserAnswers([]);
  }

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      setUserAnswers([value]);
      setSelectedOption(value);
    } else {
      setUserAnswers([]);
      setSelectedOption('');
    }
  };

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      setUserAnswers(prevAnswers => [...prevAnswers, value]);
    } else {
      setUserAnswers(prevAnswers => prevAnswers.filter(answer => answer !== value));
    }
  };



  const handleNextButtonClick = () => {
    setCurrentIndex(prevIndex => prevIndex + 1);
    setSelectedOption('');
  };

  const checkTheRightOption = (arr1:string[], arr2:string[])=>{
   
        if (arr1.length !== arr2.length) {
            return false;
          }
      
          for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
              return false;
            }
          }
          dispatch(counterRightAnwsers());
          if(questions[currentIndex].difficulty === "easy"){console.log("Правильный ответ! easy"); dispatch(countEasy());}
          if(questions[currentIndex].difficulty === "medium"){console.log("Правильный ответ! medium"); dispatch(countMedium());}
          if(questions[currentIndex].difficulty === "hard"){console.log("Правильный ответ! hard"); dispatch(countHard());}
  }


  const checkTheRightAnswer = () => {
    if (selectedOption === questions[currentIndex].correct_answer) {
        if(questions[currentIndex].difficulty === "easy"){console.log("Правильный ответ! easy"); dispatch(countEasy());}
        if(questions[currentIndex].difficulty === "medium"){console.log("Правильный ответ! medium"); dispatch(countMedium());}
        if(questions[currentIndex].difficulty === "hard"){console.log("Правильный ответ! hard"); dispatch(countHard());}
      dispatch(counterRightAnwsers());
    } else {
      console.log("Неправильный ответ!");
    }
  };

  const dispatch = useDispatch();
  const results = useSelector((state: any) => state.counter);

  const funcOpen = () => {
    setLoading(true);
    axios.get(`https://opentdb.com/api.php?amount=10&category=27`)
      .then(response => {
        const fetchedQuestions: Question[] = response.data.results.map((question: Question) => ({
          ...question,
          allRightAnswers: [question.correct_answer],
          allAnswers: [
            ...question.incorrect_answers,
            question.correct_answer
          ]
        }));

        const shuffledQuestions = fetchedQuestions.map(question => ({
          ...question,
          allAnswers: shuffleArray(question.allAnswers)
        }));
        console.log(shuffledQuestions);
        
        setQuestions(shuffledQuestions);
        setLoading(false);
      })
      .catch(error => {
        if (error.response) {
          console.error('Ошибка:', error.response.status);
        } else if (error.request) {
          console.error('Нет ответа на запрос:', error.request);
        } else {
          console.error('Ошибка настройки запроса:', error.message);
        }
      });
  };

  useEffect(() => {
    funcOpen();
  }, []);

  return (
    <div className='Questions'>
      {currentIndex === questions.length && !loading ? <Results/> : <div>
        {!loading ? <div>Вопрос №{results + 1}</div> : ''}
        {!loading && questions.length > 0 && (
          <div className='custom-width rounded bg-light text-dark p-3 mb-3'>
            <p>{questions[currentIndex].question}</p>
            {questions[currentIndex].type === 'boolean' ?
              <div className='d-flex flex-column align-items-center'>
                <input
                  type="radio"
                  id="option1"
                  name="options"
                  value='True'
                  checked={selectedOption === 'True'}
                  onChange={handleAnswerChange}
                />
                <label className={`custom-check rounded-pill border border-3 mt-4 mt-4 ${selectedOption === 'True'? 'border-info' : 'border-dark'}`} htmlFor="option1">True</label>
                <input
                  type="radio"
                  id="option2"
                  name="options"
                  value='False'
                  checked={selectedOption === 'False'}
                  onChange={handleAnswerChange}
                />
                <label className={`custom-check rounded-pill border border-3 mt-4 mt-4 ${selectedOption === 'False'? 'border-info' : 'border-dark'}`} htmlFor="option2">False</label>
              </div> :
              <div>
                {questions[currentIndex].allAnswers.map((answer: string, id: number) => (
                    <div className='d-flex flex-column align-items-center' key={answer}>
                    {questions[currentIndex].allRightAnswers.length == 1 ? (
                    <label
                     className={`custom-check rounded-pill border border-3 mt-4 mt-4 ${selectedOption === answer ? 'border-info' : 'border-dark'}`}>
                    <input
                        value={answer}
                        onChange={handleAnswerChange}
                        type="radio"
                        checked={selectedOption === answer}
                    />
                    {answer}
                </label>) : (<label>
                    <input
                      
                      value={answer}
                      onChange={handleOptionChange}
                      type="checkbox"
                    //   checked={selectedOption === answer}
                    checked={userAnswers.includes(answer)}
                    />
                    {answer}
                  </label>)}
                  
                  </div>
                ))}
              </div>
            }
          </div>
        )}
        {loading ? <div>Загрузка<p className='rotating'><img className='w-50 h-50' src={loadIcon} /></p></div> :
          <StyledButton
            id='styledButton'
           onClick={() => {
            handleNextButtonClick();
            dispatch(count());
            console.log(userAnswers);
            {questions[currentIndex].type === 'boolean' ? checkTheRightAnswer() : checkTheRightOption(userAnswers,questions[currentIndex].allRightAnswers)}
            
            resseter();
            
          }}
            disabled={selectedOption === '' && userAnswers.length === 0}
          >
            Ответить
          </StyledButton>
        }
      </div>}
    </div>
  );
}

function shuffleArray(array: any[]) {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
