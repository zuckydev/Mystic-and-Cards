async function getGameInfo() {
    let result = await requestPlayerGame();
    let resultBoard = await requestBoardInfo();
    if (!result.successful) {
        alert("Something is wrong with the game please login again!");
        window.location.pathname = "index.html";
    } else {
        GameInfo.game = result.game;
        GameInfo.board = resultBoard.board;
        if (GameInfo.scoreBoard) GameInfo.scoreBoard.update(GameInfo.game, GameInfo.board);
        else GameInfo.scoreBoard = new ScoreBoard(GameInfo.game, GameInfo.board);

        // if game ended we get the scores and prepare the ScoreWindow
        if (GameInfo.game.state == "Finished") {
            let result = await requestScore();
            GameInfo.scoreWindow = new ScoreWindow(50, 50, GameInfo.width - 100, GameInfo.height - 100, result.score, closeScore);
        }
    }
}

async function endturnAction() {
    let result = await requestEndTurn();
    if (result.successful) {
        await getGameInfo();
        GameInfo.prepareUI();
    } else alert("Something went wrong when ending the turn.")
}

async function closeScore() {
    let result = await requestCloseScore();
    if (result.successful) {
        await checkGame(true); // This should send the player back to matches
    } else alert("Something went wrong when ending the turn.")
}

async function getBoardInfo() {
    // Get the board info from the server
    let result = await requestBoardInfo();
    if (!result.successful) {
        alert("Something is wrong with the game please login again!");
        window.location.pathname = "index.html";
    }
    else {
        GameInfo.board = result.board;
        console.log("Board: ");
        console.log(GameInfo.board);

        if (GameInfo.playerHand) {
            GameInfo.playerHand.update(GameInfo.board.player.hand);
            
        } 
        else {
            GameInfo.playerHand = new PlayerHand ("Player Cards", GameInfo.board.player.hand, 100, 450, playCardAction, 10);
        }
        if (GameInfo.playerBoard) {
            GameInfo.playerBoard.update(GameInfo.board.player.board);
        }
        else {
            GameInfo.playerBoard = new PlayerBoard ("Board Cards", GameInfo.board.player.board, 100, 300, null, 10);
        }

        for (let i = 0; i < GameInfo.board.opponents.length; i++) {
            
            if (GameInfo.oppHand) {
                GameInfo.oppHand.update(GameInfo.board.opponents[i].hand);
            } else {
                GameInfo.oppHand = new OppHand ("Opponent Cards", GameInfo.board.opponents[i].hand, 100, 400, playCardAction, 10);
            }

            if (GameInfo.oppBoard) {
                GameInfo.oppBoard.update(GameInfo.board.opponents[i].board);
            } else {
                GameInfo.oppBoard = new PlayerBoard ("Opponent Board Cards", GameInfo.board.opponents[i].board, 100, 170, null, 10);
            }


        }
    }
}

async function drawCardAction(deck) {
    let result = await requestDrawCard(deck);
    if (result.successful) {
        await getGameInfo();
        await getBoardInfo();
        GameInfo.prepareUI();
    } else alert("Something went wrong when drawing a card.");
}

async function drawCommonCard() {
    drawCardAction(1);
}

async function drawEpicCard() {
    drawCardAction(2);
}

async function drawLegendaryCard() {
    drawCardAction(3);
}

async function playCardAction(card) {
    let boardPos = parseInt(prompt("What position (1, 2, 3)?"));
    
    if (boardPos > 4 || boardPos < 1) {
        alert("Please select a valid position.");
    } else {
        let result = await requestPlayCard(card, boardPos);
        if (!result.successful) {
            alert("Something went wrong when playing a card");
        }
    }
    
    await getBoardInfo();
}
