# MFC Tagger+

[![Node.js CI](https://github.com/Nefere256/mfc-tagger-plus/actions/workflows/node.js.yml/badge.svg)](https://github.com/Nefere256/mfc-tagger-plus/actions/workflows/node.js.yml)

A set of tools to help [MyFigureCollection](https://myfigurecollection.net/) contributors with tagging items.

Adding new items to the database isn't the only way to contribute to MFC. Tags allow to describe items, and they else help with searching for items with desirable features, or allow to blacklist them. There's so many tags and items to be tagged that proper tools to accelerate the work are needed. That's why this piece of code is made.

## Compile

1. 	Run commands listed below:
	````
	npm install
	npm run build
	````
	The files *bundle.js* and *bundle.css* will appear in /dist folder.

## Install

### Userscript manager

1. Install one of userscript managers available for your browser ([link](https://greasyfork.org/pl/help/installing-user-scripts)).

2. Install the userscript from one of sources:
 * the one from [Compile](#Compile) part,
 * from [Greasy Fork](https://greasyfork.org/pl/scripts/512037-mfc-tagger) where the userscript is hosted. No account required.

### Browser extension

1. Work in progress...


## Features

### Tag counter

The extension adds a count of tags to respective entries in search results, release calendar and encyclopedia pages.

![Showcase of tag counter - every item has its number of tags displayed in ](https://github.com/Nefere256/mfc-tagger-plus/raw/main/readme/img/entryCount.jpg "Tag counter")
