// Actions
async function requestBoardInfo() {
    try {
        const response = await fetch(`/api/cards/getBoard`);
        let result = await response.json();
        return {
            successful: response.status == 200,
            unauthenticated: response.status == 401,
            board: result
        };
    } catch (err) {
        // Treat 500 errors here
        console.log(err);
        return { err: err };
    }
}

async function requestPlayerHandInfo() {
    try {
        const response = await fetch(`/api/cards`);
        let result = await response.json();
        return {
            successful: response.status == 200,
            unauthenticated: response.status == 401,
            playerHand: result
        };
    } catch (err) {
        // Treat 500 errors here
        console.log(err);
        return { err: err };
    }
}

async function requestDrawCard(deck) {
    try {
        const response = await fetch(`/api/cards/draw`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    rarity: deck
                })

            });
        return { successful: response.status == 200 };
    } catch (err) {
        // Treat 500 errors here
        console.log(err);
        return { err: err };
    }
}

async function requestUpgradeMine() {
    try {
        const response = await fetch(`/api/mine/upgrade`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                })

            });
        return { successful: response.status == 200 };
    } catch (err) {
        // Treat 500 errors here
        console.log(err);
        return { err: err };
    }
}


async function requestPlayCard(card, boardPos) {
    try {
        
        const response = await fetch(`/api/cards/play`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "PATCH",
                body: JSON.stringify({
                    selectedCard: card,
                    boardPosition: boardPos
                })

            });
        return { successful: response.status == 200 };
    } catch (err) {
        
        console.log(err);
        return { err: err };
    }
}

async function requestEndTurn() {
    try {
        const response = await fetch(`/api/plays/endturn`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "PATCH"
            });
        return { successful: response.status == 200 };
    } catch (err) {
        // Treat 500 errors here
        console.log(err);
        return { err: err };
    }
}

async function requestCloseScore() {
    try {
        const response = await fetch(`/api/scores/auth/close`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "PATCH"
            });
        return { successful: response.status == 200 };
    } catch (err) {
        // Treat 500 errors here
        console.log(err);
        return { err: err };
    }
}