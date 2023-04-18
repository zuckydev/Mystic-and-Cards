class Card {
    static width = 200;
    static height = 100;
    static bgColor = [
        [0, 204, 0, 255], // Common
        [153, 51, 255, 255], // Epic
        [255, 255, 0, 255] // Legendary
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
            bgColor[this.rarity][0], // Red
            bgColor[this.rarity][1], // Green
            bgColor[this.rarity][2], // Blue
            bgColor[this.rarity][3]  // Alpha
        );

        rect(
            x,
            y,
            this.width,
            this.height
        );
    }
}

class MonsterCard extends Card {
    constructor(id, name, rarity, type, hp, attack) {
        // Call the constructor of the Card class
        super(id, name, rarity, type);
        // Save data specific to Monster Card
        this.hp = hp;
        this.attack = attack;
    }
}

class SpellCard extends Card {
    constructor(id, name, rarity, type, attack) {
        super(id, name, rarity, type)
        thid.attack = attack;

    }
}

class ShieldCard extends Card {
    constructor(id, name, rarity, type, hp) {
        super(id, name, rarity, type)
        thid.hp = hp;

    }
}

class PlayerHand {
    static nCards = 5;

    constructor(title, cardsInfo, x, y, clickAction) {
        this.title = title;
        this.x = x;
        this.y = y;
        this.width = Card.width * Deck.nCards;
        this.clickAction = clickAction;
        this.cards = this.createCards(cardsInfo);
    }
    createCards(cardsInfo) {
        let cards = [];
        let x = this.x;
        for (let cardInfo of cardsInfo) {
            cards.push(new Card(cardInfo, x, this.y + Deck.titleHeight));
            x += Card.width;
        }
        return cards;
    }
    
    update(cardsInfo) {
        this.cards = this.createCards(cardsInfo);
    }

    draw () {
        fill(0);
        noStroke();
        textSize(28);
        textAlign(CENTER, CENTER);
        text(this.title, this.x, this.y, this.width, PlayerHand.titleheight);
        for (let card of this.cards) {
            card.draw();
        }

    }

    click() {
        if (this.clickAction) {
            for (let card of this.cards) {
                if (card.click()) {
                    this.clickAction(card.card);
                }
            }
        }
    }

}