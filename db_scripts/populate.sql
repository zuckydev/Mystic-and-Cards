# Do not change the order or names of states 
#(the code is assuming specific IDs and names)
# You can add more in the end
insert into game_state (gst_state) values ('Waiting');
insert into game_state (gst_state) values ('Started');
insert into game_state (gst_state) values ('Finished');
insert into game_state (gst_state) values ('Canceled');

# Do not change the order, but you can add more in the end
insert into user_game_state (ugst_state) values ('Waiting');
insert into user_game_state (ugst_state) values ('Playing');
insert into user_game_state (ugst_state) values ('Score');
insert into user_game_state (ugst_state) values ('End');

# Possible end game states
# insert into scoreboard_state (sbs_state) values ('Tied');
# insert into scoreboard_state (sbs_state) values ('Lost');
# insert into scoreboard_state (sbs_state) values ('Won');

insert into rarity (rar_name) values
    ("Common"),
    ("Epic"),
    ("Legendary");

insert into user_game_card_state (ucs_state) values
#    ("Deck"),
    ("Hand"),
    ("Zone"),
    ("Discarded");

# insert into deck (dec_rarity_id) values
#    (1),
#    (2),
#    (3);

insert into card (crd_name, crd_rarity) values
    ("Rat", 1),
    ("Zombie", 1),
    ("Rock", 1),
    ("Spider", 1),
    ("Skeleton", 1),
    ("Kraken", 2),
    ("Reaper", 2),
    ("Golem", 2),
    ("Hydra", 3),
    ("Demon", 3),

    ("Wood Shield", 1),
    ("Wind Barrier", 1),
    ("Knight's Shield", 1),
    ("Steel Prison", 2),
    ("Diamond Wall", 2),
    ("Holy Protector", 3),
    ("Demon's King Guard", 3),

    ("Iceball", 1),
    ("Fireball", 1),
    ("Wind Blade", 1),
    ("Poison Cloud", 2),
    ("Thunderbolt", 2),
    ("Meteor", 3);


insert into card_attack (ctk_attack, ctk_hp, ctk_crd_id) values
    (2, 2, 1),
    (3, 1, 2),
    (0, 6, 3),
    (3, 3, 4),
    (4, 2, 5),
    (4, 4, 6),
    (8, 2, 7),
    (2, 12, 8),
    (7, 8, 9),
    (10, 5, 10);

insert into card_shield (csh_hp, csh_crd_id) values
    (1, 11),
    (2, 12),
    (3, 13),
    (4, 14),
    (5, 15),
    (7, 16),
    (7, 17);

insert into card_spell (csp_attack, csp_crd_id) values
    (1, 18),
    (2, 19),
    (3, 20),
    (4, 21),
    (6, 22),
    (8, 23);
=======
insert into user_game_card_state (ucs_state) values
    ("Deck"),
    ("Hand"),
    ("Zone"),
    ("Discarded");

insert into deck (dec_rarity_id) values
    (1),
    (2),
    (3);

insert into card (crd_name) values
    ("Zombie");
insert into deck_has_card (dhc_crd_id, dhc_dec_id) values
    (1, 1);

insert into card (crd_name) values
    ("Skeleton");
insert into deck_has_card (dhc_crd_id, dhc_dec_id) values
    (2, 1);

insert into card (crd_name) values
    ("Kraken");
insert into deck_has_card (dhc_crd_id, dhc_dec_id) values
    (3, 2);

insert into card (crd_name) values
    ("Golem");
insert into deck_has_card (dhc_crd_id, dhc_dec_id) values
    (4, 2);

insert into card (crd_name) values
    ("Demon");
insert into deck_has_card (dhc_crd_id, dhc_dec_id) values
    (5, 3);


insert into card (crd_name) values
    ("Wood Shield");
insert into deck_has_card (dhc_crd_id, dhc_dec_id) values
    (6, 1);

insert into card (crd_name) values
    ("Knight's Shield");
insert into deck_has_card (dhc_crd_id, dhc_dec_id) values
    (7, 1);

insert into card (crd_name) values
    ("Steel Prison");
insert into deck_has_card (dhc_crd_id, dhc_dec_id) values
    (8, 2);

insert into card (crd_name) values
    ("Diamond Wall");
insert into deck_has_card (dhc_crd_id, dhc_dec_id) values
    (9, 2);

insert into card (crd_name) values
    ("Holy Protector");
insert into deck_has_card (dhc_crd_id, dhc_dec_id) values
    (10, 3);


insert into card (crd_name) values
    ("Iceball");
insert into deck_has_card (dhc_crd_id, dhc_dec_id) values
    (11, 1);

insert into card (crd_name) values
    ("Fireball");
insert into deck_has_card (dhc_crd_id, dhc_dec_id) values
    (12, 1);

insert into card (crd_name) values
    ("Poison Cloud");
insert into deck_has_card (dhc_crd_id, dhc_dec_id) values
    (13, 2);

insert into card (crd_name) values
    ("Thunderbolt");
insert into deck_has_card (dhc_crd_id, dhc_dec_id) values
    (14, 2);

insert into card (crd_name) values
    ("Meteor");
insert into deck_has_card (dhc_crd_id, dhc_dec_id) values
    (15, 3);


insert into card_attack (ctk_attack, ctk_hp, ctk_crd_id) values
    (3, 1, 1),
    (4, 2, 2),
    (6, 4, 3),
    (2, 12, 4),
    (10, 5, 5);

insert into card_shield (csh_hp, csh_crd_id) values
    (1, 6),
    (3, 7),
    (4, 8),
    (5, 9),
    (7, 10);

insert into card_spell (csp_attack, csp_crd_id) values
    (1, 11),
    (2, 12),
    (4, 13),
    (6, 14),
    (8, 15);