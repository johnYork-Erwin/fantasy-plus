## Main
Fantasy-Plus is a website that provides users with additional information about NFL players regarding usage trends as well as play choices by their teams and much much more. Fantasy-Plus uses HTML, CSS, JS, and D3 to display graphs about what players have done over the 2017 season. Data is grabbed from profootballapi.com and munged manually. It is then merged with data from suredbits api and saved to a PostgreSQL database hosted on Node JS accessed using Knex JS.

## LogIn
Users can create profiles or login and, once logged in, a user will see a "Welcome ____" in the middle of the banner with their username inserted. A user can then search for players to add to their favorites bar. Once favorited, the statistics for the player can be easily accessed by clicking their name in the sidebar. Players can also be removed from a profile by clicking the "remove player" button. You can also log out and for each of these actions a user will be greeted with a cheerful or angry toast displaying important usability information.

## Player page
By clicking a player name in their favorites bar a user can view that players statistics for the 2017 season thus far. This page also includes graphs regarding their target share (among other players on that team at that position), their fantasy points per week and their teams" play choices (running or passing) for the season or for a specific week. By clicking a week number on the main table you can travel to the "player game" page. By clicking their team you can travel to the team page for that player.

## PlayerGame page
This page displays data about a team"s performance for a given week, from the perspective of a given player. The title contains information about the player and his team for the given week. His team code (as well as his opponent"s) can be clicked to travel to the "team" page. There is also a list of every play that player was involved in for that week, a chart comparing the present player with other players at his position who play for his team and comparing how they did that week, the currently tracked player is highlighted on this table. There are also a few doughnut charts that display information about what types of offensive plays were called that game as well as the duration of the game spent significantly behind or ahead of the other team. There seems to be a correlation with a team being significantly ahead and favoring to run the ball as well as visa versa. These graphs show that.

## Team page
The team page allows users to view how a team has done over the course of the 2017 season. These statistics can be important because a team that has a very poor offense will tend to do worse for its running backs than another team who has a reliable offense. The team a player is on matters in Fantasy Football so I wanted this information to be readily accessible as well.

## News
There is a news feed on the splash page that is updated on login with the 10 most recent news articles about the NFL from NFL.com, provided by newsapi.com. A random one is chosen and the news section is set on that article. A user can click left or right arrows to view different articles or click the image or title to open a new tab at that article"s origin. There is also pagination so the user can see that other articles are also available.


## Logo
The logo in the top left corner throughout the site is a link to the home page.

## TheFuture....
<<<<<<< HEAD
I had to pay profootballapi for the privilege of using their data, thus, this site has ceased pulling new data as of December 1st. However, data will still be shown from 2017s football season. I would love to eventually get photos for the players and tie them to the database. This process would include storing the photos with cloudinary or aws and storing a link to those photos in my PostgreSQL database. Another topic of interest for me looking forward is establishing trends of a player"s performance based on which quarterback he"s playing with. The quarterback being second string can cause odd effects such as a running back being used far more heavily but to much less avail. These statistics would be very interesting to me to track.
=======
I had to pay profootballapi for the privilege of using their data, thus, this site has ceased pulling new data as of December 1st. However, data will still be shown from 2017s football season. I would love to eventually get photos for the players and tie them to the database. This process would include storing the photos with cloudinary or aws and storing a link to those photos in my PostgreSQL database. Another topic of interest for me looking forward is establishing trends of a player's performance based on which quarterback he's playing with. The quarterback being second string can cause odd effects such as a running back being used far more heavily but to much less avail. These statistics would be very interesting to me to track.
>>>>>>> 7f5be9fa48af482dc640e59e9b1ea652650847a3
