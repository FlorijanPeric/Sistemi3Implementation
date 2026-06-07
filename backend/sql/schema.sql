-- Flower Order System – deployed database schema
-- Source: 89231252-DatabaseFlowers export (MariaDB 10.3)
-- All IDs: varchar(36) UUIDs. Status columns: varchar(50) (no ENUM constraint).

CREATE TABLE `uporabnik` (
  `uporabnik_id`          varchar(36)  NOT NULL,
  `uporabnisko_ime`       varchar(100) NOT NULL,
  `geslo`                 varchar(100) NOT NULL,
  `e_posta`               varchar(100) NOT NULL,
  `datum_dodelitve_vloge` date         NOT NULL,
  `vloga`                 varchar(50)  NOT NULL,
  `obdobje_veljavnosti`   date         DEFAULT NULL,
  PRIMARY KEY (`uporabnik_id`),
  UNIQUE KEY `e_posta` (`e_posta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `cvetlicarna` (
  `cvetlicarna_id` varchar(36)  NOT NULL,
  `uporabnik_id`   varchar(36)  NOT NULL,
  `naziv`          varchar(100) NOT NULL,
  PRIMARY KEY (`cvetlicarna_id`),
  KEY `uporabnik_id` (`uporabnik_id`),
  CONSTRAINT `cvetlicarna_ibfk_1` FOREIGN KEY (`uporabnik_id`) REFERENCES `uporabnik` (`uporabnik_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `dobavitelj` (
  `dobavitelj_id` varchar(36)   NOT NULL,
  `uporabnik_id`  varchar(36)   NOT NULL,
  `ocena`         decimal(3,2)  DEFAULT NULL CHECK (`ocena` >= 0 AND `ocena` <= 5),
  `naziv`         varchar(100)  NOT NULL,
  PRIMARY KEY (`dobavitelj_id`),
  KEY `uporabnik_id` (`uporabnik_id`),
  CONSTRAINT `dobavitelj_ibfk_1` FOREIGN KEY (`uporabnik_id`) REFERENCES `uporabnik` (`uporabnik_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `roza` (
  `roza_id`               varchar(36)   NOT NULL,
  `ime`                   varchar(100)  NOT NULL,
  `cena_na_enoto`         decimal(10,2) NOT NULL CHECK (`cena_na_enoto` >= 0),
  `sezonska_dostopnost`   varchar(50)   DEFAULT NULL,
  `dobavljivost`          varchar(100)  DEFAULT NULL,
  `datum_zacetka_ponudbe` date          DEFAULT NULL,
  `datum_konca_ponudbe`   date          DEFAULT NULL,
  `dobavitelj_id`         varchar(36)   NOT NULL,
  PRIMARY KEY (`roza_id`),
  KEY `dobavitelj_id` (`dobavitelj_id`),
  CONSTRAINT `roza_ibfk_1` FOREIGN KEY (`dobavitelj_id`) REFERENCES `dobavitelj` (`dobavitelj_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `narocilo` (
  `narocilo_id`    varchar(36) NOT NULL,
  `datum_narocila` date        NOT NULL,
  `cvetlicarna_id` varchar(36) NOT NULL,
  `datum_dostave`  date        DEFAULT NULL,
  `status`         varchar(50) NOT NULL,
  -- Allowed status values: 'v obdelavi', 'potrjeno', 'dostavljeno', 'preklicano', 'zavrnjeno'
  PRIMARY KEY (`narocilo_id`),
  KEY `cvetlicarna_id` (`cvetlicarna_id`),
  CONSTRAINT `narocilo_ibfk_1` FOREIGN KEY (`cvetlicarna_id`) REFERENCES `cvetlicarna` (`cvetlicarna_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `postavka_narocila` (
  `postavka_id`              varchar(36)   NOT NULL,
  `narocilo_id`              varchar(36)   NOT NULL,
  `roza_id`                  varchar(36)   NOT NULL,
  `kolicina`                 int(11)       NOT NULL CHECK (`kolicina` > 0),
  `cena_na_rozo`             decimal(10,2) NOT NULL CHECK (`cena_na_rozo` >= 0),
  `skupna_vrednost_postavke` decimal(10,2) NOT NULL CHECK (`skupna_vrednost_postavke` >= 0),
  PRIMARY KEY (`postavka_id`),
  KEY `narocilo_id` (`narocilo_id`),
  KEY `roza_id` (`roza_id`),
  CONSTRAINT `postavka_narocila_ibfk_1` FOREIGN KEY (`narocilo_id`) REFERENCES `narocilo` (`narocilo_id`),
  CONSTRAINT `postavka_narocila_ibfk_2` FOREIGN KEY (`roza_id`) REFERENCES `roza` (`roza_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `priporocilo` (
  `priporocilo_id`     varchar(36) NOT NULL,
  `cvetlicarna_id`     varchar(36) NOT NULL,
  `sezona`             varchar(50) NOT NULL,
  `predlagana_vrsta`   varchar(100) NOT NULL,
  `predlagana_kolicina` int(11)    NOT NULL CHECK (`predlagana_kolicina` >= 0),
  `datum_izracuna`     date        NOT NULL,
  PRIMARY KEY (`priporocilo_id`),
  KEY `cvetlicarna_id` (`cvetlicarna_id`),
  CONSTRAINT `priporocilo_ibfk_1` FOREIGN KEY (`cvetlicarna_id`) REFERENCES `cvetlicarna` (`cvetlicarna_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tracks every status change on an order
CREATE TABLE `zgodovina_narocil` (
  `zgodovina_id`   varchar(36) NOT NULL,
  `narocilo_id`    varchar(36) NOT NULL,
  `status`         varchar(50) NOT NULL,
  `datum_spremembe` date       NOT NULL,
  PRIMARY KEY (`zgodovina_id`),
  KEY `narocilo_id` (`narocilo_id`),
  CONSTRAINT `zgodovina_narocil_ibfk_1` FOREIGN KEY (`narocilo_id`) REFERENCES `narocilo` (`narocilo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
