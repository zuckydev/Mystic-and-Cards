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

# -- Game Specific --

insert into rarity (rar_name, rar_cost) values
    ("Common", 4),
    ("Epic", 6),
    ("Legendary", 12);

insert into user_game_card_state (ucs_state) values
    ("Hand"),
    ("Zone"),
    ("Discarded");

insert into card (crd_name, crd_rarity, crd_type_id, crd_ecost) values
    ("Rat", 1, 1, 2),
    ("Zombie", 1, 1, 2),
    ("Rock", 1, 1, 3),
    ("Spider", 1, 1, 3),
    ("Skeleton", 1, 1, 4),
    ("Kraken", 2, 1, 5),
    ("Reaper", 2, 1, 6),
    ("Golem", 2, 1, 7),
    ("Hydra", 3, 1, 8),
    ("Demon", 3, 1, 9),

    ("Wood Shield", 1, 2, 2),
    ("Wind Barrier", 1, 2, 3),
    ("Knight's Shield", 1, 2, 4),
    ("Steel Prison", 2, 2, 5),
    ("Diamond Wall", 2, 2, 6),
    ("Holy Protector", 3, 2, 7),
    ("River of Healing", 3, 2, 9),

    ("Iceball", 1, 3, 2),
    ("Fireball", 1, 3, 4),
    ("Wind Blade", 1, 3, 5),
    ("Poison Cloud", 2, 3, 6),
    ("Thunderbolt", 2, 3, 8),
    ("Meteor", 3, 3, 9);

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


# fake games
INSERT INTO user VALUES (1,'me','$2b$10$Wemfac2wY/7RSCdKxuYUL.GV2clfhXC66OL76uCpDFUmpYZ/bGZtW','48MnTVJ6sKIvanVHbP5Vx5rysbYrVN4EbYmk4D8xESdfm1hx8jDfNFZGNw9OZs'),(2,'me2','$2b$10$6j2xIDnnxv.TLfBSstbbO.qE7wFTf5envx/uijiFjCP3slsy7EE4K','dQ7NrsbPsuF81xFGNioR1K0tiYkjtxOhemcgMhuFIS68VrFUC9gggm3JCgzkqe');
INSERT INTO game VALUES (1,1,2);
INSERT INTO user_game VALUES (1,1,1,1,2,15,7,0,0,50),(2,2,2,1,1,15,7,0,0,50);