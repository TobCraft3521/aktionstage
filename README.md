# Aktionstage Webseite
This is the new version of the "ASG Aktionstage Webseite" built in Typescript/Next.js.
Das ist die neue Version der "ASG Aktionstage Webseite" diesmal mit Typescript/Next.js.

## Contribution
Feel free to create a pull request to contribute to the repository.
And give it a star if you are nice 🌞.
To clone and run locally, just run npm i, and set up the env:
- I recommend creating a project on supabase, as you get a free s3 bucket which is needed for file uploads and you get a postgres sql db on top.
- For the emoji AI (which isnt too excellent) you can get an api key on rapidapi: Emoji AI by alexadamski
- I have included an env.example file

## Features and improvements
### It uses an improved search featuring 
- Only one grade can be selected
- Only one day can be selected, but also deselected
- You can search for teachers (NEW) in a dropdown select
- LIVE search
  
### Core functionality
- sharable link even though the detail view happens on the same component -> layout
- Enhanced project creation multi step form with better features and ux enhancements
- Tons of details, like taken rooms show who's in there with what project, ...
- Project create and edit forms dont loose all content when inputs are invalid

### The login page has been redesigned.
UX fixes such as
- Page redirected you to many times
- Confirm form resubmission

### UI fixes such as
Bad alignment
- 😉 "Improvable" look and feel (mine isn't perfect either but I think it is better)
- More bad proportions in the header 
- Weird mobile menu behaviour
- Over-/ undersized texts/titles
- Better forms

### Added "tutorials"
They are inspired by "guided website tours" like these [ones](https://design.mindsphere.io/patterns/guided-tour.html)

### Architechture improvements
- Code and image upload storage are separated (AWS for storage) instead of storage in codebase

### Other improvements
- Default password changed for security reasons
- Server side validation and double checks
