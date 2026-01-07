-- Get team IDs
-- Assuming teams are inserted in order: 1-10 are the Libyan clubs

-- Round 1 Matches (Week 1)
INSERT INTO matches (homeTeamId, awayTeamId, matchDate, status) VALUES
(1, 2, DATE_ADD(NOW(), INTERVAL 7 DAY), 'scheduled'),
(3, 4, DATE_ADD(NOW(), INTERVAL 7 DAY), 'scheduled'),
(5, 6, DATE_ADD(NOW(), INTERVAL 7 DAY), 'scheduled'),
(7, 8, DATE_ADD(NOW(), INTERVAL 7 DAY), 'scheduled'),
(9, 10, DATE_ADD(NOW(), INTERVAL 7 DAY), 'scheduled');

-- Round 2 Matches (Week 2)
INSERT INTO matches (homeTeamId, awayTeamId, matchDate, status) VALUES
(2, 3, DATE_ADD(NOW(), INTERVAL 14 DAY), 'scheduled'),
(4, 5, DATE_ADD(NOW(), INTERVAL 14 DAY), 'scheduled'),
(6, 7, DATE_ADD(NOW(), INTERVAL 14 DAY), 'scheduled'),
(8, 9, DATE_ADD(NOW(), INTERVAL 14 DAY), 'scheduled'),
(10, 1, DATE_ADD(NOW(), INTERVAL 14 DAY), 'scheduled');

-- Round 3 Matches (Week 3)
INSERT INTO matches (homeTeamId, awayTeamId, matchDate, status) VALUES
(1, 3, DATE_ADD(NOW(), INTERVAL 21 DAY), 'scheduled'),
(2, 4, DATE_ADD(NOW(), INTERVAL 21 DAY), 'scheduled'),
(5, 7, DATE_ADD(NOW(), INTERVAL 21 DAY), 'scheduled'),
(6, 8, DATE_ADD(NOW(), INTERVAL 21 DAY), 'scheduled'),
(9, 10, DATE_ADD(NOW(), INTERVAL 21 DAY), 'scheduled');

-- Round 4 Matches (Week 4)
INSERT INTO matches (homeTeamId, awayTeamId, matchDate, status) VALUES
(3, 5, DATE_ADD(NOW(), INTERVAL 28 DAY), 'scheduled'),
(4, 6, DATE_ADD(NOW(), INTERVAL 28 DAY), 'scheduled'),
(7, 9, DATE_ADD(NOW(), INTERVAL 28 DAY), 'scheduled'),
(8, 10, DATE_ADD(NOW(), INTERVAL 28 DAY), 'scheduled'),
(1, 2, DATE_ADD(NOW(), INTERVAL 28 DAY), 'scheduled');

-- Round 5 Matches (Week 5)
INSERT INTO matches (homeTeamId, awayTeamId, matchDate, status) VALUES
(2, 5, DATE_ADD(NOW(), INTERVAL 35 DAY), 'scheduled'),
(3, 6, DATE_ADD(NOW(), INTERVAL 35 DAY), 'scheduled'),
(4, 7, DATE_ADD(NOW(), INTERVAL 35 DAY), 'scheduled'),
(8, 1, DATE_ADD(NOW(), INTERVAL 35 DAY), 'scheduled'),
(9, 10, DATE_ADD(NOW(), INTERVAL 35 DAY), 'scheduled');
