# TODO
## clean up
  - [X] compress history.lengths
  - [X] Model.ts depends on the old structure
  - [X] sync levels numbers with srs numbers (in actions and lengths)
  - [X] show index of the word in the status-title
  - [X] add more info in the info pop-up
  - [X] add 'ignore' option besides srs levels
  - [X] record history in setCardLevel
  - [X] compress history.actions
  - [ ] actions should be moved to the cards

## fix
  - [X] old dictionaries' actions are screwed up
  - [X] stats pop-up
  - [X] when registering actions
    - if the "from" and "to" levels are the same, don't do anything
    - clean up the zigzags. E.g: lengths: 1, 2, 1, 2, etc
  - [ ] use a maths library since JS sucks at math
  - [ ] add-word is not working for new version

## feat
  - [X] Allow navigating beyond current batch
  - [ ] add 'views' property to each card and show it in the info
  - [ ] option for "undo"
  - [ ] an edit option that saves the current changes and opens the file using `+/`
    - e.g: `nvim +/word file_path`
  - [ ] add a preview for "next preview date" when chosing a level

## enhancement
  - [ ] switch to SM-11, DSR or FSRS
  - [ ] add two modes: "shotgun" and "bruteforce"
    - the 1st focuses more on the new words
    - the 2nd focuses more on the currently reviewed ones