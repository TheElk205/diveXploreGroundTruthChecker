# Preliminaries

only use vanilla HTML, CSS and java script.
Do not change ANY .tsv files at all, they are our data.

# TODO
Write a web application, to display the two queries that are in the folder, namely `adHocMainTaskQueries.tsv ` and `adHocProgressTaskQueries.tsv`. They start with a comment block, denoted by # and then they have tab separated columns with:
queryId	queryString.

Their results are stored in in a file, that has _results appended before the file ending. 
their columns are: 
- Query ID, but they are prepended with a 1.
- junk
- shotID
- samlpint-stratum
- judgement

Create a website where I can first select the dataset, then select the query to show. After selecting the query, display all matching results in a simple table.

I want to be able to filter after judgement (-1, 0, 1), sampling-stratum (1, 2, 3).

