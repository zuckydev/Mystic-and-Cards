// All the variables for the game UI
// we only have one game info so everything is static
class GameInfo {
    // settings variables
    static width = 1460;
    static height = 800;

    static loading = true;

    // data
    static game;
    static board;
    static card;
    static images = {};
    static sounds = {};
    static fonts = {};
    static hand;

    // rendererers
    static scoreBoard;
    static scoreWindow;
    static playerHand;
    static oppHand;
    static playerBoard;
    static oppBoard;
    // static playerBoard;
    // static cards;

    // buttons
    static endturnButton;
    static drawCommonCard;
    static drawEpicCard;
    static drawLegendaryCard;
    static upgradeMine;
    static endButton;

    // Write your UI settings for each game state here
    // Call the method every time there is a game state change
    static prepareUI() {
        if (GameInfo.game.player.state == "Playing") {
            GameInfo.endturnButton.show();
            GameInfo.drawCommonCard.show();
            GameInfo.drawEpicCard.show();
            GameInfo.drawLegendaryCard.show();
            GameInfo.upgradeMine.show();
            GameInfo.endButton.hide();
            GameInfo.playerHand.draggable = true;
            
        } else if (GameInfo.game.player.state == "Waiting") {
            GameInfo.endturnButton.hide();
            GameInfo.drawCommonCard.hide();
            GameInfo.drawEpicCard.hide();
            GameInfo.drawLegendaryCard.hide();
            GameInfo.upgradeMine.hide();
            GameInfo.endButton.hide();
            GameInfo.playerHand.draggable = false;
            
        } else if (GameInfo.game.player.state == "Score") {
            GameInfo.endturnButton.hide();
            GameInfo.scoreWindow.open();
            GameInfo.drawCommonCard.hide();
            GameInfo.drawEpicCard.hide();
            GameInfo.drawLegendaryCard.hide();
            GameInfo.upgradeMine.hide();
            GameInfo.endButton.hide();
            GameInfo.playerHand.draggable = false;

        }else if (GameInfo.game.player.state == "End") {
            GameInfo.endturnButton.hide();
            GameInfo.scoreWindow.open();
            GameInfo.drawCommonCard.hide();
            GameInfo.drawEpicCard.hide();
            GameInfo.drawLegendaryCard.hide();
            GameInfo.upgradeMine.hide();
            GameInfo.endButton.show();
            GameInfo.sounds.Button.play()
        }
    }
}