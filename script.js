const wordText = document.querySelector(".word"),
    hintText = document.querySelector("#hint-txt"),
    curScore = document.querySelector(".scoreBox span"),
    curhighscore = document.querySelector(".highscoreBox span"),
    glbhighscore = document.querySelector(".globalhighscor span"),
    timeText = document.querySelector(".time b"),
    inputField = document.querySelector("input"),
    refreshBtn = document.querySelector(".refresh-word"),
    checkBtn = document.querySelector(".check-word");
    toastmsg=document.getElementById("snackbar");

curScore.innerHTML = 0;
curhighscore.innerHTML = 0;
glbhighscore.innerHTML = 0;

let correctWord, timer, score = 0, curLength = 4,wordArray,highscore=0,globalHighscore=0;
// let letters = new Map();
const url1 = 'https://random-word-api.herokuapp.com/word?length=';
const url2 = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const url3 = 'https://zany-overalls-tick.cyclic.app/players/';
const url4 = 'https://leaderboard-1w46.onrender.com/players';

const initTimer = maxTime => {
    clearInterval(timer);
    timer = setInterval(() => {
        if (maxTime > 0) {
            maxTime--;
            return timeText.innerText = maxTime;
        }
        score = 0;
        curScore.innerHTML = score;
        highscore=0;
        curhighscore.innerHTML=highscore;
        Swal.fire({
            title: 'Time Off!',
            text: ("You took too long. "+correctWord+ " was the correct word"),
            confirmButtonText: 'Restart',
          }).then((result) => {
            if (result.isConfirmed) {
              initGame();
            }
          })
          initGame();
    }, 1000);
}
gethighscore=async()=>{
    // console.log("334");
    //only call api if currhighscore can set global highscore or if highscore is not set yet
    if(highscore==0 || globalHighscore<highscore){
        let topscorer;
        try {
            const response = await fetch(url3 + "?lim=1");
            const result = await response.json();
            // console.log(result);
            topscorer = result[0];
            // console.log(randomObj);
        } catch (error) {
            console.error(error);
            return "NULL";
        }
        console.log(topscorer);
        globalHighscore=topscorer.score;
        glbhighscore.innerHTML = globalHighscore;
    }
    return;
}
 getword=async()=>{
    let newword;

    //get new word from random-word-API
    try {
        const response = await fetch(url1 + curLength);
        const result = await response.json();
        // console.log(result);
        newword = result[0];
        // console.log(randomObj);
    } catch (error) {
        console.error(error);
        return "NULL";
    }
    console.log(newword);

    //verify the word it it has a meaning in dictionaryapi else pick new word;
    try {
        const response = await fetch(url2 + newword);
        const result = await response.json();
        console.log(result[0].meanings[0].definitions[0].definition);
        hintText.innerHTML = result[0].meanings[0].definitions[0].definition;
    } catch (error) {
        newword=await getword();
    }
    return newword;
 }

initGame = async () => {
    if(!hintText.classList.contains("hide")){
        hintText.classList.toggle("hide"); 
    }   
    console.log("Started");
    await gethighscore();
    // console.log("999");
    let randomObj;
    randomObj=await getword();
    initTimer(30);
    const letters = new Map();
    wordArray = randomObj.split("");
    for (let i = wordArray.length - 1; i > 0; i--) {
        letters.set(wordArray[i], 1);
        let j = Math.floor(Math.random() * (i + 1));
        [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
    }
    wordText.innerText = wordArray.join("");
    // hintText.innerText = randomObj.hint;
    correctWord = randomObj.toLowerCase();;
    inputField.value = "";
    // inputField.setAttribute("maxlength", correctWord.length);
}
initGame();

const checkWord = async () => {
    
    let userWord = inputField.value.toLowerCase();
    if (userWord.length < correctWord.length){
        //  return alert("Please entre word longer than "+(correctWord.length-1) +"characters");
        //add toast
        toastmsg.innerHTML="Please entre word longer than "+(correctWord.length-1) +" characters";
        toastmsg.className = "show";
        setTimeout(function(){ toastmsg.className = toastmsg.className.replace("show", ""); }, 1500);
    }
    else if (userWord !== correctWord) {
        //not the specific word we are looking for

        //check it it uses the same letters

        let wordArr = userWord.split("");
        console.log(wordArray);
        let sameLett = true;
        for (let i = wordArr.length - 1; i > 0; i--) {
            if (wordArray.includes(wordArr[i]) == false) sameLett = false;

        }

        if (sameLett) {
            //check if it is a valid word
            let validity = true, definition;
            try {
                const response = await fetch(url2 + userWord);
                const result = await response.json();
                // console.log(result.title);
                if (result.title == "No Definitions Found") {
                    console.log("word not valid");
                    validity = false;
                }
                else {
                    definition = result.meanings[0].definitions[0].definition;
                }
                // console.log(result);
            } catch (error) {
                // console.log(error);
            }
            if (validity === true) {
                score = score + userWord.length;
                curScore.innerHTML = score;
                if(highscore<score){
                    highscore=score;
                    curhighscore.innerHTML=highscore;
                    
                }
                curLength = userWord.length;
                // sdjygyfweuygfiwuegfiewgfauyewgfiuqwgfiuqewgfquiewgfiuwygfuiyqewgfiuyewgfiuwqygfqiyuewgfiqyewugfqiewufqwuef
                toastmsg.innerHTML="+"+userWord.length +" points";
                toastmsg.className = "show";
                setTimeout(function(){ toastmsg.className = toastmsg.className.replace("show", ""); }, 1500);
                                // console.log("You created a " + curLength + " long word!");
                 initGame();
            }
            else {
                score = 0;
                curScore.innerHTML = score;
                curLength = 4;
                Swal.fire({
                    title: 'GAME OVER!',
                    text: (userWord+ " isn't a valid word"),
                    confirmButtonText: 'Restart',
                  }).then((result) => {
                    if (result.isConfirmed) {
                      initGame();
                    }
                  })
            }
        }
        else{
            //invalid characters
            //toast notification saying wrong characters
            toastmsg.innerHTML="Use only the given characters";;
        toastmsg.className = "show";
        setTimeout(function(){ toastmsg.className = toastmsg.className.replace("show", ""); }, 1500);
        }
    }
    else {
        //exact word match
        score = score + userWord.length * 3;
        curScore.innerHTML = score;
        if(highscore<score){
            highscore=score;
            curhighscore.innerHTML=highscore;
            if(highscore>globalHighscore){
                console.log("global ebest");
                const response = await fetch(url4, {
                    method: 'POST',
                    // mode:'no-cors',
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                            },
                    body: JSON.stringify({
                    username: "fwewf",
                    score: score
                    }),
                });
    
                let result =  response;
                console.log(result);
            }
        }

        toastmsg.innerHTML="Congrats! "+correctWord.toUpperCase()+" is the correct word. \n +"+userWord.length * 3 +" points";
        toastmsg.className = "show";
        setTimeout(function(){ toastmsg.className = toastmsg.className.replace("show", ""); }, 1500);

        initGame();
    }
}

// initGame();

refreshBtn.addEventListener("click", ()=>{
    hintText.classList.toggle("hide");
});
checkBtn.addEventListener("click", checkWord);