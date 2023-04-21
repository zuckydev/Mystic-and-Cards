async function getGameInfo() {
    let result = await requestPlayerGame();
    if (!result.successful) {
        alert("Something is wrong with the game please login again!");
        window.location.pathname = "index.html";
    } else {
        GameInfo.game = result.game;
        if (GameInfo.scoreBoard) GameInfo.scoreBoard.update(GameInfo.game);
        else GameInfo.scoreBoard = new ScoreBoard(GameInfo.game);

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
        console.log(GameInfo.board);

        if (GameInfo.playerHand) {
            GameInfo.playerHand.update(result.board.player.hand);
        } 
        else {
            GameInfo.playerHand = new PlayerHand ("Player Cards", result.board.player.hand, 100, 400, playCardAction);
        }

        for (let i = 0; i < game.opponents.length; i++) {
            const element = game.opponents[i];
            if (GameInfo.oppHand) {
                GameInfo.oppHand.update(result.board.game.opponents[i].hand);
            } else {
                GameInfo.oppHand = new OppHand ("Opponent Cards", result.board.opponents[i].hand, 100, 400, playCardAction);
            }
        }
    }
}

// async function getPlayerHandInfo(user) {
//     let result = await getPlayerHand(user);
//     if (!result.successful) {
//         alert("Something is wrong with the game please login again!");
//         window.location.pathname = "index.html";
//     } else {
//         GameInfo.playerHand = result;
//         if (GameInfo.playerHand) GameInfo.playerHand.update(GameInfo.hand);
//         else GameInfo.playerHand = new PlayerHand("My Cards", 200, 600, await playCardAction);
//     }
// }

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
    let result = await requestPlayCard(card);

    if (!result.successful) {
        alert("Something went wrong when playing card.");
    }
}