import React from "react";
import { decode } from "html-entities";
import { nanoid } from "nanoid"

import cn from "./cn";

function Button({
        id,
        text,
        selected,
        main,
        disabled,
        lost,
        win,
        onClick
    }: {
        id: string,
        text: string;
        selected?: boolean;
        main?: boolean;
        disabled?: boolean;
        lost?: boolean;
        win?: boolean;
        onClick: (id: string) => void;
    }) {
    return (
        <button
        onClick={() => onClick(id)}
        className={cn([
            "rounded-xl text-blue-900 font-medium py-1 px-6",
            selected ? "bg-blue-400" : "border bg-blue-100 border-blue-900",
            main && "bg-blue-700 text-white border-0 self-center px-8 py-4",
            disabled && "opacity-30",
            lost && "bg-red-300 border-0 opacity-30",
            win && "bg-green-500 border-0",
        ])}
        >
        {text}
        </button>
    );
}

function Question({ text }: { text: string }) {
    return (
        <h2 className="text-2xl font-title font-bold text-blue-900">{text}</h2>
    );
}

function Separator() {
    return <div className="border-b-[1px] w-full border-blue-300"></div>;
}

export interface Response {
    response_code: number
    results: Result[]
}

export interface Result {
    type: string
    difficulty: string
    category: string
    question: string
    correct_answer: string
    incorrect_answers: string[]
}

export interface Question {
    id: string,
    type: string,
    difficulty: string,
    category: string,
    question: string,
    answers: Button[]
}

export interface Button {
    id: string,
    text: string,
    win?: boolean,
    isCorrect: boolean,
    isSelected: boolean
}

export default function App() {
    const [data, setData] = React.useState<Response>()
    const [isLoading, setIsLoading] = React.useState(true)
    const [questions, setQuestions] = React.useState<Question[]>([])
    const [gameEnd, setGameEnd] = React.useState(false)
    const [score, setScore] = React.useState(0)

    async function getData() {
        const res = await fetch("https://opentdb.com/api.php?amount=5&difficulty=easy")
        const data: Response = await res.json()

        setData(data)
        setIsLoading(false)
    }

    function startGame() {
        setGameEnd(false)
        getData()
    }

    function restartGame() {
        setIsLoading(true)
        startGame()
    }

    React.useEffect(() => {
        startGame()
    }, [])

    React.useEffect(() => {
        if (!isLoading) {
            setQuestions(createQuestions())
        }
    }, [isLoading])

    function createQuestions() : Question[] {
        const questions: Question[] = data!?.results.map(result => {
            const answers: Button[] = result.incorrect_answers.map(answer => {
                return {
                    id: nanoid(),
                    text: answer,
                    isCorrect: false,
                    isSelected: false
                }
            });
            
            const randomIndex = Math.floor(Math.random() * answers.length)
            answers.splice(randomIndex, 0, {id: nanoid(), text: result.correct_answer, isCorrect: true, isSelected: false})
    
            return {
                id: nanoid(),
                type: result.type,
                difficulty: result.difficulty,
                category: result.category,
                question: result.question,
                answers: answers
            }
        })

        return questions
    }

    function clickButton(id: string) {
        if (gameEnd) {
            return
        }

        const selectedQuestion = questions.find(question => question.answers.map(answer => answer.id === id).find(b => b))

        selectedQuestion?.answers.map(answer => answer.isSelected = answer.id === id)

        const newQuestions = questions.map(question => question.id === selectedQuestion?.id ? selectedQuestion : question)
        
        setQuestions(newQuestions)
    }

    function checkAnswers() {
        const allSelected = questions.every(question => question.answers.find(answer => answer.isSelected))

        if (!allSelected) {
            return
        }

        let score = 0

        questions.map(question => question.answers.map(answer => {
            if (answer.isSelected) {
                answer.win = answer.isCorrect

                if (answer.isCorrect) {
                    score += 1
                }
            }
        }))

        setScore(score)

        if (!gameEnd) {
            setGameEnd(true)
        }
        else if (!isLoading) {
            setIsLoading(true)
            setTimeout(() => {
                restartGame()
            }, 1000);
        }
    }

    const questionElements = questions?.map(question => {
        const buttonElements = question.answers.map(answer => {
            const win = answer.win === true
            const lost = answer.win === false

            return (
                <Button onClick={clickButton} key={answer.id} win={win} lost={lost} id={answer.id} selected={answer.isSelected} text={decode(answer.text)} />
            )
        })

        return (
            <div key={nanoid()} className="flex flex-col gap-4">
                <Question text={decode(question.question)} />
                <div className="flex gap-4">
                {buttonElements}
                </div>
                <Separator />
            </div>
        )
    })

    return (
        <main className="w-full min-h-screen bg-blue-100 flex p-10">
        <div className="flex flex-col gap-4">
            {questionElements}
            <div className="flex items-center justify-center gap-4">
                {gameEnd && <div className="text-blue-900 font-bold">You scored {score}/{questions.length} correct answers</div>}
                <Button onClick={checkAnswers} id={nanoid()} text={gameEnd ? "Play again" : "Check answers"} main />
            </div>
        </div>
        </main>
    );
}