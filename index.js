const csv = require('csv-parser');
const discord_rpc = require('discord-rich-presence')('1088814016035561532');
const fs = require('fs');
const results = [];

const beautified_lesson_names = {
  "wobi": {
    "name": "Meetup",
  },
  "de": {
    "name": "German",
    "suffix": "Class"
  },
  "ge": {
    "name": "History",
    "suffix": "Class"
  },
  "ma": {
    "name": "Math",
    "suffix": "Class"
  },
  "Mittag": {
    "name": "Lunch",
  },
  "bio": {
    "name": "Biology",
    "suffix": "Class"
  },
  "pb": {
    "name": "Political Science",
    "suffix": "Class"
  },
  "reli": {
    "name": "Religion",
    "suffix": "Class"
  },
  "eng": {
    "name": "English",
    "suffix": "Class"
  },
  "phy": {
    "name": "Physics",
    "suffix": "Class"
  },
  "ku": {
    "name": "Art",
    "suffix": "Class"
  },
  "semi": {
    "name": "Seminar Course",
  },
  "sp": {
    "name": "Sport",
  },
  "pause": {
    "name": "Break",
  }
}

function updatePresence() {
  const date = new Date();
  const day_name = date.toLocaleDateString('en-US', { weekday: 'long' });
  const current_time = date.toLocaleTimeString('de-DE');

  fs.createReadStream('timetable.csv')
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      let lesson_found = false;
      for (let i = 0; i < results.length; i++) {
        const time = results[i].time.split('-');
        const [hour_o, minute_o] = current_time.split(':').map((x) => parseInt(x));
        const [hour_n1, minute_n1] = time[0].split(':').map((x) => parseInt(x));
        const [hour_n2, minute_n2] = time[1].split(':').map((x) => parseInt(x));
        if (hour_o > hour_n1 || (hour_o === hour_n1 && minute_o >= minute_n1)) {
          if (hour_o < hour_n2 || (hour_o === hour_n2 && minute_o <= minute_n2)) {
            lesson_found = true;
            let current_status = "In school";
            let current_lesson = results[i][day_name];
            let current_lesson_beautified = current_lesson;

            const lesson_start_time = new Date();
            lesson_start_time.setHours(hour_n1, minute_n1, 0, 0);

            const lesson_end_time = new Date();
            if (current_lesson == results[i + 1][day_name]) {
              const time_n3 = results[i + 1].time.split('-')
              const [hour_n3, minute_n3] = time_n3[1].split(':').map((x) => parseInt(x));

              lesson_end_time.setHours(hour_n3, minute_n3, 0, 0);
            } else {
              lesson_end_time.setHours(hour_n2, minute_n2, 0, 0);
            }

            if (current_lesson && beautified_lesson_names[current_lesson]) {
              current_lesson_beautified = beautified_lesson_names[current_lesson]["name"];
              if (beautified_lesson_names[current_lesson]["suffix"]) {
                current_lesson_beautified = current_lesson_beautified + " " + beautified_lesson_names[current_lesson]["suffix"]
              }
            }

            if (!current_lesson_beautified) {
              current_status = "Not in school";
              current_lesson_beautified = "No lessons today";
            }

            discord_rpc.updatePresence({
              state: "Currently in " + current_lesson_beautified,
              details: current_status,
              startTimestamp: lesson_start_time,
              endTimestamp: lesson_end_time,
              instance: false,
            });

            break;
          }
        }
      }

      if (!lesson_found) {
        discord_rpc.updatePresence({
          state: "Nothing to do",
          details: "Not in school",
          instance: false,
        });
      }
    });
}

updatePresence()
setInterval(updatePresence, 30 * 1000);
