-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Gostitelj: localhost:3306
-- Čas nastanka: 01. jun 2026 ob 09.39
-- Različica strežnika: 10.3.39-MariaDB-0ubuntu0.20.04.2
-- Različica PHP: 7.4.3-4ubuntu2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Zbirka podatkov: `89231252-DatabaseFlowers`
--

-- --------------------------------------------------------

--
-- Struktura tabele `cvetlicarna`
--

CREATE TABLE `cvetlicarna` (
  `cvetlicarna_id` varchar(36) NOT NULL,
  `uporabnik_id` varchar(36) NOT NULL,
  `naziv` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabele `dobavitelj`
--

CREATE TABLE `dobavitelj` (
  `dobavitelj_id` varchar(36) NOT NULL,
  `uporabnik_id` varchar(36) NOT NULL,
  `ocena` decimal(3,2) DEFAULT NULL CHECK (`ocena` >= 0 and `ocena` <= 5),
  `naziv` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabele `narocilo`
--

CREATE TABLE `narocilo` (
  `narocilo_id` varchar(36) NOT NULL,
  `datum_narocila` date NOT NULL,
  `cvetlicarna_id` varchar(36) NOT NULL,
  `datum_dostave` date DEFAULT NULL,
  `status` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabele `postavka_narocila`
--

CREATE TABLE `postavka_narocila` (
  `postavka_id` varchar(36) NOT NULL,
  `narocilo_id` varchar(36) NOT NULL,
  `roza_id` varchar(36) NOT NULL,
  `kolicina` int(11) NOT NULL CHECK (`kolicina` > 0),
  `cena_na_rozo` decimal(10,2) NOT NULL CHECK (`cena_na_rozo` >= 0),
  `skupna_vrednost_postavke` decimal(10,2) NOT NULL CHECK (`skupna_vrednost_postavke` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabele `priporocilo`
--

CREATE TABLE `priporocilo` (
  `priporocilo_id` varchar(36) NOT NULL,
  `cvetlicarna_id` varchar(36) NOT NULL,
  `sezona` varchar(50) NOT NULL,
  `predlagana_vrsta` varchar(100) NOT NULL,
  `predlagana_kolicina` int(11) NOT NULL CHECK (`predlagana_kolicina` >= 0),
  `datum_izracuna` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabele `roza`
--

CREATE TABLE `roza` (
  `roza_id` varchar(36) NOT NULL,
  `ime` varchar(100) NOT NULL,
  `cena_na_enoto` decimal(10,2) NOT NULL CHECK (`cena_na_enoto` >= 0),
  `sezonska_dostopnost` varchar(50) DEFAULT NULL,
  `dobavljivost` varchar(100) DEFAULT NULL,
  `datum_zacetka_ponudbe` date DEFAULT NULL,
  `datum_konca_ponudbe` date DEFAULT NULL,
  `dobavitelj_id` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabele `uporabnik`
--

CREATE TABLE `uporabnik` (
  `uporabnik_id` varchar(36) NOT NULL,
  `uporabnisko_ime` varchar(100) NOT NULL,
  `geslo` varchar(100) NOT NULL,
  `e_posta` varchar(100) NOT NULL,
  `datum_dodelitve_vloge` date NOT NULL,
  `vloga` varchar(50) NOT NULL,
  `obdobje_veljavnosti` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabele `zgodovina_narocil`
--

CREATE TABLE `zgodovina_narocil` (
  `zgodovina_id` varchar(36) NOT NULL,
  `narocilo_id` varchar(36) NOT NULL,
  `status` varchar(50) NOT NULL,
  `datum_spremembe` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indeksi zavrženih tabel
--

--
-- Indeksi tabele `cvetlicarna`
--
ALTER TABLE `cvetlicarna`
  ADD PRIMARY KEY (`cvetlicarna_id`),
  ADD KEY `uporabnik_id` (`uporabnik_id`);

--
-- Indeksi tabele `dobavitelj`
--
ALTER TABLE `dobavitelj`
  ADD PRIMARY KEY (`dobavitelj_id`),
  ADD KEY `uporabnik_id` (`uporabnik_id`);

--
-- Indeksi tabele `narocilo`
--
ALTER TABLE `narocilo`
  ADD PRIMARY KEY (`narocilo_id`),
  ADD KEY `cvetlicarna_id` (`cvetlicarna_id`);

--
-- Indeksi tabele `postavka_narocila`
--
ALTER TABLE `postavka_narocila`
  ADD PRIMARY KEY (`postavka_id`),
  ADD KEY `narocilo_id` (`narocilo_id`),
  ADD KEY `roza_id` (`roza_id`);

--
-- Indeksi tabele `priporocilo`
--
ALTER TABLE `priporocilo`
  ADD PRIMARY KEY (`priporocilo_id`),
  ADD KEY `cvetlicarna_id` (`cvetlicarna_id`);

--
-- Indeksi tabele `roza`
--
ALTER TABLE `roza`
  ADD PRIMARY KEY (`roza_id`),
  ADD KEY `dobavitelj_id` (`dobavitelj_id`);

--
-- Indeksi tabele `uporabnik`
--
ALTER TABLE `uporabnik`
  ADD PRIMARY KEY (`uporabnik_id`),
  ADD UNIQUE KEY `e_posta` (`e_posta`);

--
-- Indeksi tabele `zgodovina_narocil`
--
ALTER TABLE `zgodovina_narocil`
  ADD PRIMARY KEY (`zgodovina_id`),
  ADD KEY `narocilo_id` (`narocilo_id`);

--
-- Omejitve tabel za povzetek stanja
--

--
-- Omejitve za tabelo `cvetlicarna`
--
ALTER TABLE `cvetlicarna`
  ADD CONSTRAINT `cvetlicarna_ibfk_1` FOREIGN KEY (`uporabnik_id`) REFERENCES `uporabnik` (`uporabnik_id`);

--
-- Omejitve za tabelo `dobavitelj`
--
ALTER TABLE `dobavitelj`
  ADD CONSTRAINT `dobavitelj_ibfk_1` FOREIGN KEY (`uporabnik_id`) REFERENCES `uporabnik` (`uporabnik_id`);

--
-- Omejitve za tabelo `narocilo`
--
ALTER TABLE `narocilo`
  ADD CONSTRAINT `narocilo_ibfk_1` FOREIGN KEY (`cvetlicarna_id`) REFERENCES `cvetlicarna` (`cvetlicarna_id`);

--
-- Omejitve za tabelo `postavka_narocila`
--
ALTER TABLE `postavka_narocila`
  ADD CONSTRAINT `postavka_narocila_ibfk_1` FOREIGN KEY (`narocilo_id`) REFERENCES `narocilo` (`narocilo_id`),
  ADD CONSTRAINT `postavka_narocila_ibfk_2` FOREIGN KEY (`roza_id`) REFERENCES `roza` (`roza_id`);

--
-- Omejitve za tabelo `priporocilo`
--
ALTER TABLE `priporocilo`
  ADD CONSTRAINT `priporocilo_ibfk_1` FOREIGN KEY (`cvetlicarna_id`) REFERENCES `cvetlicarna` (`cvetlicarna_id`);

--
-- Omejitve za tabelo `roza`
--
ALTER TABLE `roza`
  ADD CONSTRAINT `roza_ibfk_1` FOREIGN KEY (`dobavitelj_id`) REFERENCES `dobavitelj` (`dobavitelj_id`);

--
-- Omejitve za tabelo `zgodovina_narocil`
--
ALTER TABLE `zgodovina_narocil`
  ADD CONSTRAINT `zgodovina_narocil_ibfk_1` FOREIGN KEY (`narocilo_id`) REFERENCES `narocilo` (`narocilo_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
