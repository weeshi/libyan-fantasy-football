CREATE TABLE `playerGameweekStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`gameweekId` int NOT NULL,
	`matchId` int,
	`minutesPlayed` int NOT NULL DEFAULT 0,
	`goals` int NOT NULL DEFAULT 0,
	`assists` int NOT NULL DEFAULT 0,
	`cleanSheet` int NOT NULL DEFAULT 0,
	`yellowCards` int NOT NULL DEFAULT 0,
	`redCards` int NOT NULL DEFAULT 0,
	`goalsAgainst` int NOT NULL DEFAULT 0,
	`saves` int NOT NULL DEFAULT 0,
	`bonusPoints` int NOT NULL DEFAULT 0,
	`totalPoints` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playerGameweekStats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scoringRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleType` varchar(100) NOT NULL,
	`position` enum('goalkeeper','defender','midfielder','forward','all') NOT NULL DEFAULT 'all',
	`points` int NOT NULL,
	`description` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scoringRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userChips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userTeamId` int NOT NULL,
	`chipType` enum('captain','triple_captain','wildcard','bench_boost','free_hit') NOT NULL,
	`isUsed` int NOT NULL DEFAULT 0,
	`usedInGameweek` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userChips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `gameweeks` ADD `transferDeadline` timestamp;--> statement-breakpoint
ALTER TABLE `gameweeks` ADD `isTransferWindowOpen` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `leagues` ADD `leagueType` enum('classic','head_to_head','cup') DEFAULT 'classic' NOT NULL;--> statement-breakpoint
ALTER TABLE `userTeams` ADD `activeChip` varchar(50);