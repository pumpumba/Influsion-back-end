# Influsion back-end


## Git
Git will be the version control system used in Pumba.

### 1.0 Install Git
#### 1.1 MacOS and Linux
Git is preinstalled on many Linux-distributions and MacOS sometimes have Git preinstalled. Write `git --version` in the terminal to verify that Git is installed. If Git was not installed, you should now get instructions in the terminal about how to install Git. Your Mac might ask you to install the *Xcode Command Line Tools* – do this, these tools contains Git.

#### 1.2 Windows
Windows does not have Git preinstalled. There are two alternatives to install Git in Windows:
- Git for Windows: Download and install *Git for Windows* https://gitforwindows.org. This is a terminal that contains all the Git functionality.
- Windows 10 Linux Subsystem: If you use Windows 10 you can install a Linux terminal in Windows that works just like a normal Linux terminal with all its features. This means that you can run Git, SSH, Docker etcetera from it. Search for Windows 10 Linux Subsystem for installation instructions.

### 2.0 Get started
When you have installed Git you need to download the Pumba development git repository. In the terminal, go to the folder you want to download the project in. You could call this folder *repos* for example and clone the repository into that folder. Clone the repository with the following command: `git clone https://github.com/pumpumba/project_TBD.git`.

The first time you use Git it might ask you to set some information such as your name etcetera. You will also have to connect to Github via SSH if you want to be able to push to the repository, here is a guide: https://help.github.com/articles/connecting-to-github-with-ssh/

If you use the Windows 10 Linux Subsystem, make sure that you stand in a folder that is accessible by Windows.

This is what it could look like after getting started:
[Getting started MacOS](readme_files/Gettingstartedmac.png)

### 3.0 Fundamental Git commands
`git clone <URL>` - Clone the project. This is usually done once per project.
`git status ` – See the status about what is going to be committed.
`git add <filename>` - Add a file to be committed.
`git add -u` – Add all files you have edited to be committed (does not include files you have just created or removed).
`git commit` – Commit the changes locally.
`git push` – Upload your local commit.
`git pull` – Download commits. Do this often so that you have the latest changes!
`git diff` – See what has been edited but not committed.
`git checkout <branchname>` – Change to another branch.
`git branch <branchname>` – Create a new branch.
`git stash` – Remove your own changes locally (and store them in a mysterious place locally). You could do this for example if you want to do a git pull but Git says that you have done changes locally and you want to throw away your local changes.

There are more commands. Look at this PDF for more info: https://education.github.com/git-cheat-sheet-education.pdf

### 4.0 The Pumba Git-workflow
Do not add unnecessary files in the git repository, such as files with a name that starts with a dot etcetera.
Never develop on Master or Development directly, create branches instead.
Tip: At the Pumba Github page one can see all the branches. Go to Insights --> Network on the projects Github page.

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
