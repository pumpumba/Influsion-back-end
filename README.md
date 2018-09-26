# project_TBD

## Docker

### Installation

Start by downloading Docker Desktop:

- [Windows 10 Professional or Enterprise 64-bit](https://store.docker.com/editions/community/docker-ce-desktop-windows)

- [Mac OS Yosemite 10.10.3 or above](https://store.docker.com/editions/community/docker-ce-desktop-mac)

- [Docker Toolbox for other Windows or OSX versions](https://docs.docker.com/toolbox/overview/)

- [Other operating systems](https://store.docker.com/search?type=edition&offering=community)

Make sure to choose a linux container environment during installation (standard). After installation you are good to go.

### Using Docker

1. Start a terminal on your computer. If you are using Docker Toolbox, start the docker terminal included in the installation.
2. Navigate to your project folder (Example: /Projects/Influsion). Make sure you have cloned the project from Git.
3. To run the server, enter `docker-compose up --build`. This will build the container and then run it in the foreground of the terminal. You can add the command `-d` which runs it detached so you can continue using the terminal for other use.
4. Navigate to [localhost](http://localhost) if you are using Docker Desktop. If you are using Docker toolbox your host IP will probably differ, but will be specified when starting the server.

### Common errors

#### virtualization

Some errors might hinder you from starting either docker or the container. A common problem is not having enabled virtualization. To check this on Windows:

1. Start the task manager `ctrl+shift+esc`.
2. Click `Performance`.
3. Click `CPU`.

If virtualization is enabled you are good to go. Otherwise you will have to enter BIOS to enable this. How to do this differs depending on you motherboard type and computer manufacturer.

#### Error building or running docker-compose

If you are having trouble running the docker container, try the following:

1. Begin by making sure the container is down using `docker-compose down`. Follow this by `docker-compose up --build`.
2. If this does not work, restart the Docker software and enter `docker-compose up --build` in your terminal.
