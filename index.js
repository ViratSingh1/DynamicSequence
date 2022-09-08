const express = require('express');
const bodyparser = require('body-parser');
const app = express();
app.use(bodyparser.urlencoded({extended:true}));

class solve
{
    constructor(valMatch = 2, valNotMatch = -1, valGap = -1)
    {
        this.valMatch = valMatch;
        this.valNotMatch = valNotMatch;
        this.valGap = valGap;
    }

    localSolve(str, ptr)
    {
        this.str = str;
        this.ptr = ptr;
        this.rows = str.length + 1;
        this.cols = ptr.length + 1;
        localSolveInit();
        localSolveUtil();
        return [solp, solq];
    }

    valScore(scoreArray, rowIndex, colIndex)
    {
        var similarity = (str[rowIndex-1]==ptr[colIndex-1])?valMatch:valNotMatch;
        var scoreDiagonal = scoreArray[rowIndex-1][colIndex-1] + similarity;
        var scoreAbove = scoreArray[rowIndex-1][colIndex] + valGap;
        var scoreLeft = scoreArray[rowIndex][colIndex-1] + valGap;
        return Math.max(scoreDiagonal,scoreAbove,scoreLeft);
    }

    localSolveInit()
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

    localSolveUtil()
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
}

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get('/style.css', function(req, res) {
    res.sendFile(__dirname + "/style.css");
});

app.get('/projectimage.png', function(req, res) {
    res.sendFile(__dirname + "/projectimage.png");
});

app.get('/registerUtil.html', function(req, res) {
    res.sendFile(__dirname + "/registerUtil.html");
});
app.get('/signUtil.html', function(req, res) {
    res.sendFile(__dirname + "/signUtil.html");
});
app.get('/sol.html', function(req, res) {
    res.sendFile(__dirname + "/sol.html");
});
app.get('/dashboard.html', function(req, res) {
    res.sendFile(__dirname + "/dashboard.html");
});

app.post('/register', function(req, res) {
    res.send("now it is possible to post");
});

app.post('/solve', function(req, res) {
    res.send("javascript");
});

app.get('/index.html', function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.listen(3000);