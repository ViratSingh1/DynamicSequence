
function searchr() 
{
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("searchVal");
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++)
    {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        if (filter.length>0&&txtValue.toUpperCase().indexOf(filter) > -1)
        {
            li[i].style.display = "block";
        }
        else
        {
            li[i].style.display = "none";
        }
    }
}

function validateInput() 
    {
    let fs = document.forms["fillValues"]["firstSeq"].value;
    let ss = document.forms["fillValues"]["secondSeq"].value;
    let fv = document.forms["fillValues"]["matchValue"].value;
    let sv = document.forms["fillValues"]["notMatchValue"].value;
    let tv = document.forms["fillValues"]["gapValue"].value;
    if (fs == "" || ss == "")
    {
        alert("Sequence Value must be filled out");
        return false;
    }
    if((fv.length>0&&fv.charAt(0)!='-'&&(fv.charAt(0)<'0'||fv.charAt(0)>'9'))||(sv.length>0&&sv.charAt(0)!='-'&&(sv.charAt(0)<'0')||sv.charAt(0)>'9')||(tv.length>0&&tv.charAt(0)!='-'&&(tv.charAt(0)<'0'||tv.charAt(0)>'9')))
    {
        alert("Value must be a Number");
        return false;
    }
    for(let i=1;i<fv.length;i++)
    {
        if(fv.charAt(i)<='0'||fv.charAt(i)>='9')
        {
        alert("Value must be a Number");
        return false;
        }
    }
    for(let i=1;i<sv.length;i++)
    {
        if(sv.charAt(i)<='0'||sv.charAt(i)>='9')
        {
        alert("Value must be a Number");
        return false;
        }
    }
    for(let si=1;i<tv.length;i++)
    {
        if(tv.charAt(i)<='0'||tv.charAt(i)>='9')
        {
        alert("Value must be a Number");
        return false;
        }
    }
}