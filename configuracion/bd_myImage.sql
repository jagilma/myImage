-- phpMyAdmin SQL Dump
-- version 4.6.6
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 12, 2017 at 09:12 PM
-- Server version: 5.5.56-cll-lve
-- PHP Version: 5.6.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bd_myImage`
--
CREATE DATABASE IF NOT EXISTS `bd_myImage` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `bd_myImage`;

-- --------------------------------------------------------

--
-- Table structure for table `syslog`
--

DROP TABLE IF EXISTS `syslog`;
CREATE TABLE `syslog` (
  `IP` text,
  `RRSS` text,
  `ACCION` text,
  `RESULTADO` text,
  `TIME` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- --------------------------------------------------------

--
-- Table structure for table `uploadedImages`
--

DROP TABLE IF EXISTS `uploadedImages`;
CREATE TABLE `uploadedImages` (
  `RRSS` text,
  `ID` text,
  `ID_POST` text,
  `URL` text,
  `TIME` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
