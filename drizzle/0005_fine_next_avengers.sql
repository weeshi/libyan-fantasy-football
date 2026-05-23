CREATE TABLE `cupMatches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cupId` int NOT NULL,
	`roundId` int,
	`round` int NOT NULL,
	`team1Id` int NOT NULL,
	`team2Id` int NOT NULL,
	`team1Points` int NOT NULL DEFAULT 0,
	`team2Points` int NOT NULL DEFAULT 0,
	`winner` int,
	`status` enum('pending','completed','walkover') NOT NULL DEFAULT 'pending',
	`matchDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cupMatches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cupRounds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cupId` int NOT NULL,
	`roundNumber` int NOT NULL,
	`gameweekId` int,
	`status` enum('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cupRounds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cupStandings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cupId` int NOT NULL,
	`teamId` int NOT NULL,
	`position` int NOT NULL,
	`wins` int NOT NULL DEFAULT 0,
	`losses` int NOT NULL DEFAULT 0,
	`pointsFor` int NOT NULL DEFAULT 0,
	`pointsAgainst` int NOT NULL DEFAULT 0,
	`status` enum('active','eliminated','champion') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cupStandings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cupTournaments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leagueId` int,
	`name` varchar(255) NOT NULL,
	`description` text,
	`cupType` enum('single_elimination','double_elimination') NOT NULL DEFAULT 'single_elimination',
	`status` enum('draw','in_progress','completed','cancelled') NOT NULL DEFAULT 'draw',
	`startGameweek` int,
	`totalTeams` int NOT NULL,
	`currentRound` int NOT NULL DEFAULT 1,
	`totalRounds` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cupTournaments_id` PRIMARY KEY(`id`)
);
