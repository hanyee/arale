define("#switchable/0.8.1/extra/easing",[],function(a,b,c){var d=c.exports={easeNone:function(a){return a},easeIn:function(a){return a*a},easeOut:function(a){return(2-a)*a},easeBoth:function(a){return(a*=2)<1?.5*a*a:.5*(1- --a*(a-2))},easeInStrong:function(a){return a*a*a*a},easeOutStrong:function(a){return 1- --a*a*a*a},easeBothStrong:function(a){return(a*=2)<1?.5*a*a*a*a:.5*(2-(a-=2)*a*a*a)},elasticIn:function(a){var b=.3,c=b/4;return a===0||a===1?a:-(pow(2,10*(a-=1))*sin((a-c)*2*PI/b))},elasticOut:function(a){var b=.3,c=b/4;return a===0||a===1?a:pow(2,-10*a)*sin((a-c)*2*PI/b)+1},elasticBoth:function(a){var b=.45,c=b/4;return a===0||(a*=2)===2?a:a<1?-0.5*pow(2,10*(a-=1))*sin((a-c)*2*PI/b):pow(2,-10*(a-=1))*sin((a-c)*2*PI/b)*.5+1},backIn:function(a){return a===1&&(a-=.001),a*a*((BACK_CONST+1)*a-BACK_CONST)},backOut:function(a){return(a-=1)*a*((BACK_CONST+1)*a+BACK_CONST)+1},backBoth:function(a){return(a*=2)<1?.5*a*a*(((BACK_CONST*=1.525)+1)*a-BACK_CONST):.5*((a-=2)*a*(((BACK_CONST*=1.525)+1)*a+BACK_CONST)+2)},bounceIn:function(a){return 1-Easing.bounceOut(1-a)},bounceOut:function(a){var b=7.5625,c;return a<1/2.75?c=b*a*a:a<2/2.75?c=b*(a-=1.5/2.75)*a+.75:a<2.5/2.75?c=b*(a-=2.25/2.75)*a+.9375:c=b*(a-=2.625/2.75)*a+.984375,c},bounceBoth:function(a){return a<.5?Easing.bounceIn(a*2)*.5:Easing.bounceOut(a*2-1)*.5+.5}}});