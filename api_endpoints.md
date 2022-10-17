This is a list of endpoints that we will be interacting with 
These endpoints are defined in our nest backend ( see lesson_14 )

castVote -
url: localhost:3030/cast-vote
params: 
    - proposal
    - amount ?

returns:
    - object 
        - string to display in UI
            - success
            - error

delegate -


queryResults -
url: localhost:3030/query-results
params: none
returns: proposal

- the proposal returnsed is the one with most votes