async function refresh() {
    if (GameInfo.game.player.state == "Waiting") {
        // Every time we are waiting
        await getGameInfo();
        await getBoardInfo();
        if (GameInfo.game.player.state != "Waiting") {
            // The moment we pass from waiting to play
            GameInfo.prepareUI();
        }
    }
    // Nothing to do when we are playing since we control all that happens 
    // so no update is needed from the server
}

function preload() {

}

async function setup() {
    let canvas = createCanvas(GameInfo.width, GameInfo.height);
    canvas.parent('game');
    // preload  images

    await getGameInfo();
    await getBoardInfo();
    setInterval(refresh, 1000);

    //buttons (create a separated function if they are many)
    GameInfo.endturnButton = createButton('End Turn');
    GameInfo.endturnButton.parent('game');
    GameInfo.endturnButton.position(GameInfo.width - 150, GameInfo.height - 50);
    GameInfo.endturnButton.mousePressed(endturnAction);
    GameInfo.endturnButton.addClass('game');

    GameInfo.drawCommonCard = createButton('Draw Common Card');
    GameInfo.drawCommonCard.parent('game');
    GameInfo.drawCommonCard.position(GameInfo.width / 2 + 200, GameInfo.height / 2);
    GameInfo.drawCommonCard.mousePressed(drawCommonCard);
    GameInfo.drawCommonCard.addClass('game');

    GameInfo.drawEpicCard = createButton('Draw Epic Card');
    GameInfo.drawEpicCard.parent('game');
    GameInfo.drawEpicCard.position(GameInfo.width / 2, GameInfo.height / 2 + 50);
    GameInfo.drawEpicCard.mousePressed(drawEpicCard);
    GameInfo.drawEpicCard.addClass('game');

    GameInfo.drawLegendaryCard = createButton('Draw Legendary Card');
    GameInfo.drawLegendaryCard.parent('game');
    GameInfo.drawLegendaryCard.position(GameInfo.width / 2, GameInfo.height / 2 + 100);
    GameInfo.drawLegendaryCard.mousePressed(drawLegendaryCard);
    GameInfo.drawLegendaryCard.addClass('game');
    
    GameInfo.prepareUI();

    GameInfo.loading = false;
}

function draw() {
    background(95, 145, 100);
    if (GameInfo.loading) {
        textAlign(CENTER, CENTER);
        textSize(40);
        fill('black');
        text('Loading...', GameInfo.width / 2, GameInfo.height / 2);
    } else if (GameInfo.game.state == "Finished" && GameInfo.scoreWindow) {
        GameInfo.scoreWindow.draw();
    } else if (GameInfo.game.state == "Started") {
        GameInfo.playerHand.draw();
    } else {
        GameInfo.scoreBoard.draw();
        GameInfo.playerHand.draw();
    }
}

async function mouseClicked() {}