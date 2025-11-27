CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userTeamId` int NOT NULL,
	`playerId` int NOT NULL,
	`transactionType` enum('buy','sell') NOT NULL,
	`price` int NOT NULL,
	`previousPrice` int,
	`budgetBefore` int NOT NULL,
	`budgetAfter` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
