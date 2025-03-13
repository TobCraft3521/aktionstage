# Aktionstage Webseite

This is the new version of the "ASG Aktionstage Webseite" built in Typescript/Next.js.
Das ist die neue Version der "ASG Aktionstage Webseite" diesmal mit Typescript/Next.js.

## Contribution

Feel free to fork and create a pull request to contribute to the repository.
And give it a star if you are nice 🌞.
To clone and run locally, just run git clone ...; npm i; and set up the env:

- I recommend creating a project on supabase, as you get a free s3 bucket which is needed for file uploads and you get a postgres sql db on top.
- For the emoji AI (which isnt too excellent) you can get an api key on rapidapi: Emoji AI by alexadamski
- For analytics create a project on PostHog and add secrets to the env
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
- Awesome multi-step form to not overwhelm users with tons of inputs (like in the edit form)
- Edit form shows live changes and a summary of changes
- Full room and teacher availability management

### The login page has been redesigned.

UX fixes such as

- Faster lcp (largest contentful paint) through chunk loading projects on explore page (tanstack useInfiniteQuery)
- Page redirected you to many times
- Confirm form resubmission (php issues)

### UI fixes such as

Bad alignment

- 😉 "Improvable" look and feel (mine isn't perfect either but I think it is better)
- More bad proportions in the header
- Weird mobile menu behaviour
- Over-/ undersized texts/titles
- Better forms (eg. multi-step)

### Added "tutorials"

They are inspired by "guided website tours" like these [ones](https://design.mindsphere.io/patterns/guided-tour.html)

### Architechture improvements

- Code and image upload storage are separated (AWS s3 for storage) instead of storage in codebase

### Other improvements

- Default password changed for security reasons (before: birthday; after: student wlan password)
- Server side validation and access right checks
