let valMatch = 2;
let valNotMatch = -1;
let valGap = -1;
let str;
let ptr;
let str_p;
let str_q;
let sol_p;
let sol_q;
    
solve(str_p, str_q)
{
    str = str_p;
    ptr = str_q;
    rows = str.length + 1;
    cols = ptr.length + 1;
    globalSolveInit();
    globaalSolveUtil();
    return [sol_p, sol_q];
}

valScore(scoreArray, rowIndex, colIndex)
{
    let similarity = (str[rowIndex-1]==ptr[colIndex-1])?valMatch:valNotMatch;
    let scoreDiagonal = scoreArray[rowIndex-1][colIndex-1] + similarity;
    let scoreAbove = scoreArray[rowIndex-1][colIndex] + valGap;
    let scoreLeft = scoreArray[rowIndex][colIndex-1] + valGap;
    return (str[rowIndex-1]==ptr[colIndex-1])?scoreDiagonal:((scoreAbove<scoreLeft)?scoreAbove:scoreLeft);
}

globalSolveInit()
{
    var scoreArray = [];
    for(var i=0;i<rows;i++)
    {
        scoreArray[i] = [];
        for(var j=0;j<cols;j++)
        {
            scoreArray[i].push(0);
        }
    }
    var maxScore = 0;
    var maxRowIndex = rows;
    var maxColIndex = cols;
    for(var i=1;i<rows;i++)
    {
        for(var j=1;j<cols;j++)
        {
            var score = valScore(scoreArray, i, j);
            if(score>maxScore)
            {
                maxScore = score;
                maxRowIndex = i;
                maxColIndex = j;
            }
            scoreArray[i][j] = score;
        }
    }
    this.scoreArray = scoreArray;
    this.initRowIndex = maxRowIndex;
    this.initColIndex = maxColIndex;
}

valTrace(rowIndex, colIndex)
{
    var diagonal = scoreArray[rowIndex-1][colIndex-1];
    var top = scoreArray[rowIndex-1][colIndex];
    var left = scoreArray[rowIndex][colIndex-1];
    if((diagonal>=top)&&(diagonal>=left))
    {
        return (diagonal!=0)?1:0;
    }
    else if((top>diagonal)&&(top>=left))
    {
        return (top!=0)?2:0;
    }
    else if((left>diagonal)&&(left>top))
    {
        return (left!=0)?3:0;
    }
    return 0;
}

globalSolveUtil()
{
    var solp = [];
    var solq = [];
    var traceVal = valTrace(initRowIndex, initColIndex);
    var rowIndex = initRowIndex;
    var colIndex = initColIndex;
    while(traceVal!=0)
    {
        if(traceVal==1)
        {
            solp.push(str[rowIndex-1]);
            solq.push(ptr[colIndex-1]);
            rowIndex--;
            colIndex--;
        }
        else if(traceVal==2)
        {
            solp.push(str[rowIndex-1]);
            solq.push('-');
            rowIndex--;
        }
        else
        {
            solp.push('-');
            solq.push(ptr[colIndex-1]);
            colIndex--;
        }
        traceVal = valTrace(rowIndex, colIndex);
    }
    solp.push(str[rowIndex-1]);
    solq.push(ptr[rowIndex-1]);
    this.solp = solp.reverse();
    this.solq = solq.reverse();
}

module.exports = {
    gocalSolve,
    valMatch,
    valNotMatch,
    valGap,
};

