## Set of files involved in running enki on all books


### Data

`book-data/USER_ubl.txt` - Unapproved Book List (UBL). User-maintained file. Gives user the option to supply books not in the ABL. When `update_books.rb/updater.sh` runs, it draws from this file as well as the [ABL](https://github.com/openstax/content-manager-approved-books/blob/main/approved-book-list.json).

Format:
```
repo-name-1 book-slug-1
repo-name-1 book-slug-2
...
```
To ensure data in the UBL is included in `AUTO_books.txt`, be sure to rerun the updater after editing this file.

`book-data/AUTO_books.txt` - List of books. Format: same as `USER_ubl.txt`. Autogenerated file. Generated by `update_books.rb/updater.sh`, and combines data from ABL and UBL.

Note: All data files should end with a single newline.

### Scripts

All scripts are meant to be run from Enki root (eg. by calling `./cross-lib/updater.sh` from enki folder).

`update_books.rb` - Updates or creates the list of books in `AUTO_books.txt`. Requires Ruby to be installed.

`updater.sh` - Runs `update_books.rb` without dependencies installed (bundles Docker `build` and `run`).

`run_enki_on_all.sh` - Iterates over books in `AUTO_books.txt`, running enki to generate each. Outputs status of each run & the time to stdout. Book files are found in `/data/<slug>-<command>`. 

Options:
- --command: A [step or set of steps](../step-config.json) to run on all books . Example: `all-pdf`

## Logs

When `run_enki_on_all.sh` is called, it redirects the output from each book's run to a log file. The naming system for log files is `<repo>-<slug>.txt`.