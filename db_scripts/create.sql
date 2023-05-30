drop database if exists macdb;

create database macdb;

use macdb;

create table user (
    usr_id int not null auto_increment,
    usr_name varchar(60) not null,
    usr_pass varchar(200) not null, 
    usr_token varchar(200),
    primary key (usr_id));

create table game (
    gm_id int not null auto_increment,
    gm_turn int not null default 1,
    gm_state_id int not null,
    primary key (gm_id));

create table game_state (
    gst_id int not null auto_increment,
    gst_state varchar(60) not null,
    primary key (gst_id));

create table user_game (
    ug_id int not null auto_increment,
    ug_order int,
    ug_user_id int not null,
    ug_game_id int not null,
    ug_state_id int not null,
    ug_gold int not null default 15,
    ug_mine_level int not null default 1,
	ug_mine_level_cost int not null default 5,
    ug_hp int not null default 50,
    primary key (ug_id));

create table user_game_state (
    ugst_id int not null auto_increment,
    ugst_state varchar(60) not null,
    primary key (ugst_id));

# -- Game Specific Tables --

# -- Card Tables --

create table card (
    crd_id int not null auto_increment,
    crd_name varchar(60) not null,
    crd_rarity int not null,
    crd_type_id int not null,
    primary key (crd_id));

create table rarity (
    rar_id int not null auto_increment,
    rar_name varchar(60) not null,
    rar_cost int not null,
    primary key (rar_id));

create table card_attack (
	ctk_id int not null auto_increment,
	ctk_attack int not null,
	ctk_hp int not null,
	ctk_crd_id int not null,
	primary key (ctk_id));

create table card_shield (
	csh_id int not null auto_increment,
	csh_hp int not null,
	csh_crd_id int not null,
	primary key (csh_id));

create table card_spell (
	csp_id int not null auto_increment,
	csp_attack int not null,
	csp_crd_id int not null,
	primary key (csp_id));

create table user_game_card_state (
    ucs_id int not null auto_increment,
    ucs_state varchar(60) not null,
    primary key (ucs_id));

# -- User Cards --

create table user_game_card (
    ugc_id int not null auto_increment,
    ugc_crd_id int not null,
    ugc_state_id int not null,
    ugc_user_game_id int not null,
    primary key (ugc_id));

create table user_game_card_attack (
    uca_id int not null auto_increment,
    uca_ugc_id int not null,
    uca_hp int not null,
    uca_ap int not null,
    primary key (uca_id));

create table user_game_hand (
    ugh_id int not null auto_increment,
    ugh_ugc_id int not null, 
    ugh_user_game_id int not null,
    primary key (ugh_id));

create table user_game_board (
    ugb_id int not null auto_increment,
    ugb_ugc_id int not null,
    ugb_position int not null,
    ugb_ug_id int not null,
    primary key (ugb_id));

create table user_game_discard (
    ugd_id int not null auto_increment,
    ugd_ugc_id int not null,
    primary key(ugd_id));

create table scoreboard (
    sb_id int not null auto_increment,
    sb_user_game_id int not null,
    sb_state_id int not null,
    sb_points int not null,
    primary key (sb_id));

create table scoreboard_state (
    sbs_id int not null auto_increment,
    sbs_state varchar(60) not null,
    primary key (sbs_id));

# Foreign Keys

alter table game add constraint game_fk_match_state
            foreign key (gm_state_id) references game_state(gst_id) 
			ON DELETE NO ACTION ON UPDATE NO ACTION;

alter table user_game add constraint user_game_fk_user
            foreign key (ug_user_id) references user(usr_id) 
			ON DELETE NO ACTION ON UPDATE NO ACTION;

alter table user_game add constraint user_game_fk_game
            foreign key (ug_game_id) references game(gm_id) 
			ON DELETE NO ACTION ON UPDATE NO ACTION;

alter table user_game add constraint user_game_fk_user_game_state
            foreign key (ug_state_id) references user_game_state(ugst_id) 
			ON DELETE NO ACTION ON UPDATE NO ACTION;

# -- Cards --

alter table card_attack add constraint card_attack_fk_card
            foreign key (ctk_crd_id) references card(crd_id) 
			ON DELETE NO ACTION ON UPDATE NO ACTION;

alter table card_shield add constraint card_shield_fk_card
            foreign key (csh_crd_id) references card(crd_id)
			ON DELETE NO ACTION ON UPDATE NO ACTION;

alter table card_spell add constraint card_spell_fk_card
            foreign key (csp_crd_id) references card(crd_id) 
            ON DELETE NO ACTION ON UPDATE NO ACTION;

alter table card add constraint card_fk_rarity
            foreign key (crd_rarity) references rarity(rar_id)
            ON DELETE NO ACTION ON UPDATE NO ACTION;

# -- User Game Card --

alter table user_game_card add constraint user_game_card_fk_card
            foreign key (ugc_crd_id) references card(crd_id) 
			ON DELETE NO ACTION ON UPDATE NO ACTION;

alter table user_game_card add constraint user_game_card_fk_user_game_card_state
            foreign key (ugc_state_id) references user_game_card_state(ucs_id)
            ON DELETE NO ACTION ON UPDATE NO ACTION;

alter table user_game_card add constraint user_game_card_fk_user_game
            foreign key (ugc_user_game_id) references user_game(ug_id)
            ON DELETE NO ACTION ON UPDATE NO ACTION;

alter table user_game_card_attack add constraint user_game_card_attack_fk_user_game_card
            foreign key (uca_ugc_id) references user_game_card(ugc_id)
            ON DELETE NO ACTION ON UPDATE NO ACTION;

# -- User Game Hand --

alter table user_game_hand add constraint user_game_hand_fk_user_game_card
            foreign key (ugh_ugc_id) references user_game_card(ugc_id)
            ON DELETE NO ACTION ON UPDATE NO ACTION;

# -- User Game Board --

alter table user_game_board add constraint user_game_board_fk_user_game_card
            foreign key (ugb_ugc_id) references user_game_card(ugc_id)
            ON DELETE NO ACTION ON UPDATE NO ACTION;

# -- User Game Discard --

alter table user_game_discard add constraint user_game_discard_fk_user_game_card
            foreign key (ugd_ugc_id) references user_game_card(ugc_id)
            ON DELETE NO ACTION ON UPDATE NO ACTION;

