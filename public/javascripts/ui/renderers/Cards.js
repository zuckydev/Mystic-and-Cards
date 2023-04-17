class Card {
    static width = 200;
    static height = 100;
    static bgColor = [
        [0, 204, 0, 255], // Common
        [153, 51, 255, 255], // Epic
        [255, 255, 0, 255] // Legendary
    ]
    // color is a p5js function
    // color(bgColor[this.rarity][0], bgColor[this.rarity][1], bgColor[this.rarity][2], bgColor[this.rarity][3]);
    
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
        // Save data specific to Monster Car
        this.hp = hp;
        this.attack = attack;
    }
}