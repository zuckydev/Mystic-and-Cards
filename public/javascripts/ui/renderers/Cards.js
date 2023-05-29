class Card {
    static width = 150;
    static height = 200;
    static titleTextSize = 12;
    static infoTextSize = 25;
    static bgColor = [
        [91, 255, 129, 255], // Common
        [173, 91, 255, 255], // Epic
        [255, 194, 91, 255] // Legendary
    ]
    static cardType = [
        "Monster",
        "Shield",
        "Spell"
    ]
    
    constructor(id, name, rarity, type, state, position, img) {
        this.id = id;
        this.name = name;
        this.rarity = rarity;
        this.type = type;
        this.state = state;
        this.position = position;
        this.img = img;

        // dragging
        this.dragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.dragX = 0;
        this.dragY = 0;
        this.selected = false;
    }

    draw(x, y) {
        this.x = x;
        this.y = y;

        fill('white');
        textFont(GameInfo.fonts.CardFont);
        textSize(Card.titleTextSize);
        textAlign(CENTER, CENTER);
        textSize(18);
        
        if (this.dragging) {
            image(this.img, this.dragX, this.dragY, Card.width, Card.height);
            text(this.name, this.dragX, this.dragY + 125, Card.width, Card.height * 0.25);
            textSize(19);
            text(Card.cardType[this.type - 1], this.dragX - 25, this.dragY + 100, Card.width, 30);
        } else {
            image(this.img, this.x, this.y, Card.width, Card.height);
            text(this.name, this.x, this.y + 130, Card.width, Card.height * 0.25);
            textSize(19);
            text(Card.cardType[this.type - 1], x - 25, y + 103, Card.width, 30);
        }
    }
}

class MonsterCard extends Card {
    constructor(id, name, rarity, type, state, position, img, hp, attack) {
        // Call the constructor of the Card class
        super(id, name, rarity, type, state, position, img);
        // Save data specific to Monster Card
        this.hp = hp;
        this.attack = attack;
    }

    draw(x, y) {
        super.draw(x, y);
        textSize(Card.infoTextSize);
        textFont(GameInfo.fonts.CombatFont);
        if (this.dragging) {
            text(this.hp, this.dragX + 57, this.dragY + 68, Card.width, Card.height * 0.5);
            text(this.attack, this.dragX + 32, this.dragY + 68, Card.width, Card.height * 0.5);

        } else {
            text(this.hp, x + 57, y + 68, Card.width, Card.height * 0.5);
            text(this.attack, x + 32, y  + 68, Card.width, Card.height * 0.5);
        }
    }
}

class ShieldCard extends Card {
    constructor(id, name, rarity, type, state, position, img, hp) {
        super(id, name, rarity, type, state, position, img)
        this.hp = hp;
    }
    
    draw(x, y) {
        super.draw(x, y);
        textFont(GameInfo.fonts.CombatFont);
        textSize(Card.infoTextSize);

        if (this.dragging) {
            text(this.hp, this.dragX + 42, this.dragY  + 65, Card.width, Card.height * 0.5);
        } else {
            text(this.hp, x + 42, y  + 65, Card.width, Card.height * 0.5);
        }
    } 
    
}

class SpellCard extends Card {
    constructor(id, name, rarity, type, state, position, img, attack) {
        super(id, name, rarity, type, state, position, img)
        this.attack = attack;
    }
    
    draw(x, y) {
        super.draw(x, y);
        textSize(Card.infoTextSize);

        if (this.dragging) {
            text(this.attack, this.dragX, this.dragY  + (Card.height * 0.6), Card.width, Card.height * 0.4);
        } else {
            text(this.attack, x, y  + (Card.height * 0.6), Card.width, Card.height * 0.4);
        }
    }
}

class PlayerHand {
    static nCards = 5;
    static titleHeight = 50;

    constructor(title, cardsInfo, x, y, clickAction, cardSpacing, dragAction) {

        this.title = title;
        this.x = x;
        this.y = y;
        this.width = Card.width * PlayerHand.nCards;
        this.clickAction = clickAction;
        this.cardSpacing = cardSpacing;
        this.scale = scale;
        this.cards = this.createCards(cardsInfo);

        // dragging
        this.draggable = false;
        this.dragAction = dragAction;
        this.draggingCard = null;
    }
    
    createCards(cardsInfo) {
        let cards = [];
        for (let cardInfo of cardsInfo) {
            
            if (cardInfo.type == 1) {
                cards.push(new MonsterCard(cardInfo.id, cardInfo.name, cardInfo.rarity, cardInfo.type, cardInfo.state, cardInfo.position, GameInfo.images.cards[cardInfo.cardID - 1], cardInfo.hp, cardInfo.attack));
            }
            else if (cardInfo.type == 2) {
                cards.push(new ShieldCard(cardInfo.id, cardInfo.name, cardInfo.rarity, cardInfo.type, cardInfo.state, cardInfo.position, GameInfo.images.Fireball, cardInfo.hp));
            }
            else if (cardInfo.type == 3) {
                cards.push(new SpellCard(cardInfo.id, cardInfo.name, cardInfo.rarity, cardInfo.type, cardInfo.state, cardInfo.position, GameInfo.images.Fireball, cardInfo.attack));
            }
        }
        return cards;
    }
    
    update(cardsInfo) {
        this.cards = this.createCards(cardsInfo);
    }

    updateDrag() {
        if (this.draggingCard) {
            
            this.draggingCard.dragX = mouseX + this.draggingCard.offsetX;
            this.draggingCard.dragY = mouseY + this.draggingCard.offsetY;
        }
      }

    draw() {
        textSize(28);
        textAlign(CENTER, CENTER);
        // text(this.title, this.x, this.y, this.width, 400);
        let x = 400;
        for (let card of this.cards) {
            card.draw(x, this.y);
            x += (Card.width + this.cardSpacing);
        }
    }

    press() {
        if (!this.draggable) {
        return;
        } 
        else {

            for (let card of this.cards) {
                if (this.draggable && mouseX > card.x && mouseX < card.x + Card.width && mouseY > card.y && mouseY < card.y + Card.height) {
                    
                    card.offsetX = card.x - mouseX;
                    card.offsetY = card.y - mouseY;
                    
                    card.dragging = true;
                    this.draggingCard = card;
                }
            }
        }
    }

    async release() {
        if (!this.draggable || this.draggingCard === null) {
        return;
        }
        this.draggingCard.dragging = false;
        if (this.dragAction) {
            let cardBoardPos = GameInfo.playerBoard.getDragCardBoardPos(this.draggingCard.dragX, this.draggingCard.dragY);
            
            // console.log(cardBoardPos)
            if (cardBoardPos) {
                await this.dragAction(this.draggingCard, cardBoardPos);
            }
                
        }
        this.draggingCard = null;
    }

}
                
class PlayerBoard extends PlayerHand {
    constructor(title, cardsInfo, x, y, clickAction, cardSpacing, dragAction) {
        super(title, cardsInfo, x, y, clickAction, cardSpacing, dragAction);
    }

    getDragCardBoardPos(cardX, cardY) {
        // console.log(cardX)
        
        let boardPosWidth = Card.width + 10;
        let boardPosHeight = Card.height;
        
        for (let i = 0; i < 3; i++) {
            if (this.x + (boardPosWidth * i) < cardX && 
            this.x + (boardPosWidth * (i + 1)) > cardX &&
            this.y < cardY &&
            (this.y + boardPosHeight) > cardY) {
                return i + 1;
            }
            
        }
        
        return null;
    }
    
    draw() {
        const ctx = canvas.getContext("2d");
        let boardPosWidth = Card.width + 10;

        ctx.fillStyle = "black";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, Card.width, Card.height);
        ctx.strokeRect(this.x + boardPosWidth, this.y, Card.width, Card.height);
        ctx.strokeRect(this.x + boardPosWidth * 2, this.y, Card.width, Card.height);
        
        textSize(28);
        textAlign(CENTER, CENTER);

        // drawing cards
        for (let card of this.cards) {
            let currentX = this.x;
            if (card.position == 1) {
                card.draw(currentX, this.y);
            } else if (card.position == 2) {
                currentX += Card.width + 10;
                card.draw(currentX, this.y);
            } else if (card.position == 3) {
                currentX += (Card.width * 2) + 10;
                card.draw(currentX, this.y);
            }
        }

        strokeWeight (1);
        stroke (0, 0, 0);
    }
}

class OppCard {
    static width = 150;
    static height = 200;
    static bgColor = [
        [91, 255, 129, 255], // Common
        [173, 91, 255, 255], // Epic
        [255, 194, 91, 255] // Legendary
    ]
    
    constructor(id, name, rarity, type, state) {
        this.id = id;
        this.name = name;
        this.rarity = rarity;
        this.type = type;
        this.state = state;
    }

    draw(x, y) {
        fill(
            Card.bgColor[this.rarity - 1][0], // Red
            Card.bgColor[this.rarity - 1][1], // Green
            Card.bgColor[this.rarity - 1][2], // Blue
            Card.bgColor[this.rarity - 1][3]  // Alpha
        );

        rect(
            x,
            y,
            Card.width,
            Card.height
        );
    }
}

class OppHand {
    static nCards = 5;
    static titleHeight = 50;

    constructor(title, cardsInfo, x, y) {
        this.title = title;
        this.x = x;
        this.y = y;
        this.width = OppCard.width * OppHand.nCards;
        this.cards = this.createCards(cardsInfo);
    }

    createCards(cardsInfo) {
        let cards = [];
        for (let cardInfo of cardsInfo) {
            cards.push(new OppCard(cardInfo.id, cardInfo.name, cardInfo.rarity, cardInfo.type, cardInfo.state, cardInfo.position));
        }
        return cards;
    }
    
    update(cardsInfo) {
        this.cards = this.createCards(cardsInfo);
    }

    draw() {
        textSize(28);
        textAlign(CENTER, CENTER);
        // text(this.title, this.x, this.y, this.width, 400);
        let boardPosWidth = OppCard.width + 10;
        
        for (let card of this.cards) {
            card.draw(this.x + boardPosWidth * this.cards.indexOf(card), this.y);
            // x += OppCard.width;
        }
    }
}