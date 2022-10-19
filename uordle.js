const letters = document.querySelectorAll('.boxes__input');
const loadingDiv = document.querySelector('.info-bar');
const ATTEMPT_MAX_LENGTH = 5;
const ROUNDS = 6

async function init(){
    let attempt = ""
    let currentRow = 0
    let isLoading = true

    const res = await fetch("https://words.dev-apis.com/word-of-the-day?random=1")
    const resObj = await res.json();
    let done = false
    const word = resObj.word.toUpperCase()
    const wordParts = word.split("")
    const map = makeMap(wordParts);
    setLoading(false);
    isLoading = false;



    function addLetter(letter){
        if (attempt.length < ATTEMPT_MAX_LENGTH){
            attempt += letter;
        } else{
            attempt = attempt.substring(0, attempt.length -1)+ letter
        }

        letters[ATTEMPT_MAX_LENGTH * currentRow +attempt.length -1].innerText = letter; //typing and moving to next box
    }

    async function submit(){
        if(attempt.length != ATTEMPT_MAX_LENGTH) {
            return;
        }

        isLoading = true ;
        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: attempt })
        });

        const resObj = await res.json();
        const validWord = resObj.validWord;

        isLoading = false;
        setLoading(false);

        if(!validWord){
            invalidAttempt();
            return
        }

        const attemptParts = attempt.split("")
        const map = makeMap(wordParts);

        for(let i = 0; i < ATTEMPT_MAX_LENGTH; i++) {
            //mask as corret
            if(attemptParts[i] === wordParts[i]) {
                letters[currentRow * ATTEMPT_MAX_LENGTH + i].classList.add("correct");
                map[attemptParts[i]]--;
            }
        }

        for(let i = 0; i < ATTEMPT_MAX_LENGTH; i++){
            if(attemptParts[i] === wordParts[i]) {
                //do nothing
                
            } else if(wordParts.includes(attemptParts[i]) && map[attemptParts[i]]){
                letters[currentRow *ATTEMPT_MAX_LENGTH +i].classList.add("close");
            }else{
                letters[currentRow *ATTEMPT_MAX_LENGTH +i].classList.add("wrong")
            }

        }

        currentRow++

        if(attempt === word){
            done = true;
            alert(`ganhou`)
            document.querySelector(".brand").classList.add("winner")
            return;

        } else if(currentRow === ROUNDS){
            alert(`you loose, the word was ${word}`);
            done = true
        }

        attempt= "";

    }

    function backspace () {
        attempt = attempt.substring(0, attempt.length -1)
        letters[ATTEMPT_MAX_LENGTH * currentRow +attempt.length].innerText = "" 

    }

    function invalidAttempt (){

        for(let i = 0; i < ATTEMPT_MAX_LENGTH; i++) {
            letters[currentRow *ATTEMPT_MAX_LENGTH + i].classList.remove("invalid")

            setTimeout(function (){
                letters[currentRow *ATTEMPT_MAX_LENGTH +i].classList.add("invalid")

            },10)

        }
    }




    document.addEventListener('keydown', function handleKeyPress(event){
        if(done || isLoading){
            return
        }
        const key = event.key;

        switch(true){
            case key === "Enter":
                submit()
                break;
            case key === "Backspace":
                backspace()
                break;
            case isLetter(key):
                addLetter(key.toUpperCase())
                break;
            default:
                //do nothing
        }
        

    });
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading){
    loadingDiv.classList.toggle('show', isLoading);

}

function makeMap(array) {
    const obj = {};
    for(let i = 0; i < array.length; i++) {
        const letter = array[i]
        if(obj[letter]){
            obj[letter]++

        } else{
            obj[letter] = 1
        }
    }
    return obj;
}

init();