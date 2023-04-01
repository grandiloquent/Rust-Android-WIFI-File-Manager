document.querySelectorAll('[bind]').forEach(element => {
    if (element.getAttribute('bind')) {
        window[element.getAttribute('bind')] = element;
    }
    [...element.attributes].filter(attr => attr.nodeName.startsWith('@')).forEach(attr => {
        if (!attr.value) return;
        element.addEventListener(attr.nodeName.slice(1), evt => {
            window[attr.value](evt);
        });
    });
});
const slugify = function (s) {
  return encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-'));
};
const defaults = {
  includeLevel: [1, 2],
  containerClass: 'table-of-contents',
  slugify: slugify,
  markerPattern: /^\[\[toc\]\]/im,
  listType: 'ul',
  format: function (content, md) {
    return md.renderInline(content);
  },
  forceFullToc: false,
  containerHeaderHtml: undefined,
  containerFooterHtml: undefined,
  transformLink: undefined,
};

function findHeadlineElements(levels, tokens, options) {
  const headings = [];
  let currentHeading = null;

  tokens.forEach(token => {
    if (token.type === 'heading_open') {
      const id = findExistingIdAttr(token);
      const level = parseInt(token.tag.toLowerCase().replace('h', ''), 10);
      if (levels.indexOf(level) >= 0) {
        currentHeading = {
          level: level,
          text: null,
          anchor: id || null
        };
      }
    }
    else if (currentHeading && token.type === 'inline') {
      const textContent = token.children
        .filter((childToken) => childToken.type === 'text' || childToken.type === 'code_inline')
        .reduce((acc, t) => acc + t.content, '');
      currentHeading.text = textContent;
      if (! currentHeading.anchor) {
        currentHeading.anchor = options.slugify(textContent, token.content);
      }
    }
    else if (token.type === 'heading_close') {
      if (currentHeading) {
        headings.push(currentHeading);
      }
      currentHeading = null;
    }
  });

  return headings;
}


function findExistingIdAttr(token) {
  if (token && token.attrs && token.attrs.length > 0) {
    const idAttr = token.attrs.find( (attr) => {
      if (Array.isArray(attr) && attr.length >= 2) {
        return attr[0] === 'id';
      }
      return false;
    });
    if (idAttr && Array.isArray(idAttr) && idAttr.length >= 2) {
      const [key, val] = idAttr;
      return val;
    }
  }
  return null;
}
function getMinLevel(headlineItems) {
  return Math.min(...headlineItems.map(item => item.level));
}
function addListItem(level, text, anchor, rootNode) {
  const listItem = { level, text, anchor, children: [], parent: rootNode };
  rootNode.children.push(listItem);
  return listItem;
}
function flatHeadlineItemsToNestedTree(headlineItems) {
  // create a root node with no text that holds the entire TOC. this won't be rendered, but only its children
  const toc = { level: getMinLevel(headlineItems) - 1, anchor: null, text: null, children: [], parent: null };
  // pointer that tracks the last root item of the current list
  let currentRootNode = toc;
  // pointer that tracks the last item (to turn it into a new root node if necessary)
  let prevListItem = currentRootNode;

  headlineItems.forEach(headlineItem => {
    // if level is bigger, take the previous node, add a child list, set current list to this new child list
    if (headlineItem.level > prevListItem.level) {
      // eslint-disable-next-line no-unused-vars
      Array.from({ length: headlineItem.level - prevListItem.level }).forEach(_ => {
        currentRootNode = prevListItem;
        prevListItem = addListItem(headlineItem.level, null, null, currentRootNode);
      });
      prevListItem.text = headlineItem.text;
      prevListItem.anchor = headlineItem.anchor;
    }
    // if level is same, add to the current list
    else if (headlineItem.level === prevListItem.level) {
      prevListItem = addListItem(headlineItem.level, headlineItem.text, headlineItem.anchor, currentRootNode);
    }
    // if level is smaller, set current list to currentlist.parent
    else if (headlineItem.level < prevListItem.level) {
      for (let i = 0; i < prevListItem.level - headlineItem.level; i++) {
        currentRootNode = currentRootNode.parent;
      }
      prevListItem = addListItem(headlineItem.level, headlineItem.text, headlineItem.anchor, currentRootNode);
    }
  });

  return toc;
}

/**
* Recursively turns a nested tree of tocItems to HTML.
* @param {TocItem} tocItem
* @returns {string}
*/
function tocItemToHtml(tocItem, options, md) {
  return '<' + options.listType + '>' + tocItem.children.map(childItem => {
    let li = '<li>';
    let anchor = childItem.anchor;
    if (options && options.transformLink) {
      anchor = options.transformLink(anchor);
    }

    let text = childItem.text ? options.format(childItem.text, md, anchor) : null;

    li += anchor ? `<a href="#${anchor}">${text}</a>` : (text || '');

    return li + (childItem.children.length > 0 ? tocItemToHtml(childItem, options, md) : '') + '</li>';
  }).join('') + '</' + options.listType + '>';
}


function toc(md, o) {
  const options = Object.assign({}, defaults, o);
  const tocRegexp = options.markerPattern;
  let gstate;

  function toc(state, silent) {
    let token;
    let match;

    // Reject if the token does not start with [
    if (state.src.charCodeAt(state.pos) !== 0x5B /* [ */) {
      return false;
    }
    // Don't run any pairs in validation mode
    if (silent) {
      return false;
    }

    // Detect TOC markdown
    match = tocRegexp.exec(state.src.substr(state.pos));
    match = !match ? [] : match.filter(function (m) { return m; });
    if (match.length < 1) {
      return false;
    }

    // Build content
    token = state.push('toc_open', 'toc', 1);
    token.markup = '[[toc]]';
    token = state.push('toc_body', '', 0);
    token = state.push('toc_close', 'toc', -1);

    // Update pos so the parser can continue
    var newline = state.src.indexOf('\n', state.pos);
    if (newline !== -1) {
      state.pos = newline;
    } else {
      state.pos = state.pos + state.posMax + 1;
    }

    return true;
  }

  md.renderer.rules.toc_open = function (tokens, index) {
    var tocOpenHtml = '<div class="' + options.containerClass + '">';

    if (options.containerHeaderHtml) {
      tocOpenHtml += options.containerHeaderHtml;
    }

    return tocOpenHtml;
  };

  md.renderer.rules.toc_close = function (tokens, index) {
    var tocFooterHtml = '';

    if (options.containerFooterHtml) {
      tocFooterHtml = options.containerFooterHtml;
    }

    return tocFooterHtml + '</div>';
  };

  md.renderer.rules.toc_body = function (tokens, index) {
    if (options.forceFullToc) {
      throw ("forceFullToc was removed in version 0.5.0. For more information, see https://github.com/Oktavilla/markdown-it-table-of-contents/pull/41");
    } else {
      const headlineItems = findHeadlineElements(options.includeLevel, gstate.tokens, options);
      const toc = flatHeadlineItemsToNestedTree(headlineItems);
      const html = tocItemToHtml(toc, options, md);
      return html;
    }
  };

  // Catch all the tokens for iteration later
  md.core.ruler.push('grab_state', function (state) {
    gstate = state;
  });

  // Insert TOC
  md.inline.ruler.after('emphasis', 'toc', toc);
};
!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n():"function"==typeof define&&define.amd?define(n):(e||self).markdownItAnchor=n()}(this,function(){var e=!1,n={false:"push",true:"unshift",after:"push",before:"unshift"},t={isPermalinkSymbol:!0};function r(r,i,a,l){var o;if(!e){var c="Using deprecated markdown-it-anchor permalink option, see https://github.com/valeriangalliat/markdown-it-anchor#permalinks";"object"==typeof process&&process&&process.emitWarning?process.emitWarning(c):console.warn(c),e=!0}var s=[Object.assign(new a.Token("link_open","a",1),{attrs:[].concat(i.permalinkClass?[["class",i.permalinkClass]]:[],[["href",i.permalinkHref(r,a)]],Object.entries(i.permalinkAttrs(r,a)))}),Object.assign(new a.Token("html_block","",0),{content:i.permalinkSymbol,meta:t}),new a.Token("link_close","a",-1)];i.permalinkSpace&&a.tokens[l+1].children[n[i.permalinkBefore]](Object.assign(new a.Token("text","",0),{content:" "})),(o=a.tokens[l+1].children)[n[i.permalinkBefore]].apply(o,s)}function i(e){return"#"+e}function a(e){return{}}var l={class:"header-anchor",symbol:"#",renderHref:i,renderAttrs:a};function o(e){function n(t){return t=Object.assign({},n.defaults,t),function(n,r,i,a){return e(n,t,r,i,a)}}return n.defaults=Object.assign({},l),n.renderPermalinkImpl=e,n}var c=o(function(e,r,i,a,l){var o,c=[Object.assign(new a.Token("link_open","a",1),{attrs:[].concat(r.class?[["class",r.class]]:[],[["href",r.renderHref(e,a)]],r.ariaHidden?[["aria-hidden","true"]]:[],Object.entries(r.renderAttrs(e,a)))}),Object.assign(new a.Token("html_inline","",0),{content:r.symbol,meta:t}),new a.Token("link_close","a",-1)];if(r.space){var s="string"==typeof r.space?r.space:" ";a.tokens[l+1].children[n[r.placement]](Object.assign(new a.Token("string"==typeof r.space?"html_inline":"text","",0),{content:s}))}(o=a.tokens[l+1].children)[n[r.placement]].apply(o,c)});Object.assign(c.defaults,{space:!0,placement:"after",ariaHidden:!1});var s=o(c.renderPermalinkImpl);s.defaults=Object.assign({},c.defaults,{ariaHidden:!0});var f=o(function(e,n,t,r,i){var a=[Object.assign(new r.Token("link_open","a",1),{attrs:[].concat(n.class?[["class",n.class]]:[],[["href",n.renderHref(e,r)]],Object.entries(n.renderAttrs(e,r)))})].concat(n.safariReaderFix?[new r.Token("span_open","span",1)]:[],r.tokens[i+1].children,n.safariReaderFix?[new r.Token("span_close","span",-1)]:[],[new r.Token("link_close","a",-1)]);r.tokens[i+1]=Object.assign(new r.Token("inline","",0),{children:a})});Object.assign(f.defaults,{safariReaderFix:!1});var u=o(function(e,r,i,a,l){var o;if(!["visually-hidden","aria-label","aria-describedby","aria-labelledby"].includes(r.style))throw new Error("`permalink.linkAfterHeader` called with unknown style option `"+r.style+"`");if(!["aria-describedby","aria-labelledby"].includes(r.style)&&!r.assistiveText)throw new Error("`permalink.linkAfterHeader` called without the `assistiveText` option in `"+r.style+"` style");if("visually-hidden"===r.style&&!r.visuallyHiddenClass)throw new Error("`permalink.linkAfterHeader` called without the `visuallyHiddenClass` option in `visually-hidden` style");var c=a.tokens[l+1].children.filter(function(e){return"text"===e.type||"code_inline"===e.type}).reduce(function(e,n){return e+n.content},""),s=[],f=[];if(r.class&&f.push(["class",r.class]),f.push(["href",r.renderHref(e,a)]),f.push.apply(f,Object.entries(r.renderAttrs(e,a))),"visually-hidden"===r.style){if(s.push(Object.assign(new a.Token("span_open","span",1),{attrs:[["class",r.visuallyHiddenClass]]}),Object.assign(new a.Token("text","",0),{content:r.assistiveText(c)}),new a.Token("span_close","span",-1)),r.space){var u="string"==typeof r.space?r.space:" ";s[n[r.placement]](Object.assign(new a.Token("string"==typeof r.space?"html_inline":"text","",0),{content:u}))}s[n[r.placement]](Object.assign(new a.Token("span_open","span",1),{attrs:[["aria-hidden","true"]]}),Object.assign(new a.Token("html_inline","",0),{content:r.symbol,meta:t}),new a.Token("span_close","span",-1))}else s.push(Object.assign(new a.Token("html_inline","",0),{content:r.symbol,meta:t}));"aria-label"===r.style?f.push(["aria-label",r.assistiveText(c)]):["aria-describedby","aria-labelledby"].includes(r.style)&&f.push([r.style,e]);var d=[Object.assign(new a.Token("link_open","a",1),{attrs:f})].concat(s,[new a.Token("link_close","a",-1)]);(o=a.tokens).splice.apply(o,[l+3,0].concat(d)),r.wrapper&&(a.tokens.splice(l,0,Object.assign(new a.Token("html_block","",0),{content:r.wrapper[0]+"\n"})),a.tokens.splice(l+3+d.length+1,0,Object.assign(new a.Token("html_block","",0),{content:r.wrapper[1]+"\n"})))});function d(e,n,t,r){var i=e,a=r;if(t&&Object.prototype.hasOwnProperty.call(n,i))throw new Error("User defined `id` attribute `"+e+"` is not unique. Please fix it in your Markdown to continue.");for(;Object.prototype.hasOwnProperty.call(n,i);)i=e+"-"+a,a+=1;return n[i]=!0,i}function p(e,n){n=Object.assign({},p.defaults,n),e.core.ruler.push("anchor",function(e){for(var t,i={},a=e.tokens,l=Array.isArray(n.level)?(t=n.level,function(e){return t.includes(e)}):function(e){return function(n){return n>=e}}(n.level),o=0;o<a.length;o++){var c=a[o];if("heading_open"===c.type&&l(Number(c.tag.substr(1)))){var s=n.getTokensText(a[o+1].children),f=c.attrGet("id");f=null==f?d(n.slugify(s),i,!1,n.uniqueSlugStartIndex):d(f,i,!0,n.uniqueSlugStartIndex),c.attrSet("id",f),!1!==n.tabIndex&&c.attrSet("tabindex",""+n.tabIndex),"function"==typeof n.permalink?n.permalink(f,n,e,o):(n.permalink||n.renderPermalink&&n.renderPermalink!==r)&&n.renderPermalink(f,n,e,o),o=a.indexOf(c),n.callback&&n.callback(c,{slug:f,title:s})}}})}return Object.assign(u.defaults,{style:"visually-hidden",space:!0,placement:"after",wrapper:null}),p.permalink={__proto__:null,legacy:r,renderHref:i,renderAttrs:a,makePermalink:o,linkInsideHeader:c,ariaHidden:s,headerLink:f,linkAfterHeader:u},p.defaults={level:1,slugify:function(e){return encodeURIComponent(String(e).trim().toLowerCase().replace(/\s+/g,"-"))},uniqueSlugStartIndex:1,tabIndex:"-1",getTokensText:function(e){return e.filter(function(e){return["text","code_inline"].includes(e.type)}).map(function(e){return e.content}).join("")},permalink:!1,renderPermalink:r,permalinkClass:s.defaults.class,permalinkSpace:s.defaults.space,permalinkSymbol:"¶",permalinkBefore:"before"===s.defaults.placement,permalinkHref:s.defaults.renderHref,permalinkAttrs:s.defaults.renderAttrs},p.default=p,p});
//# sourceMappingURL=markdownItAnchor.umd.js.map




const id = new URL(window.location).searchParams.get("id");
let baseUri = window.location.host === '127.0.0.1:5500' ? 'http://192.168.8.55:10808' : '';
render();

async function render() {
    //     textarea.value = localStorage.getItem("content");

    //     if (id) {
    //         try {
    //             const obj = await loadData();
    //             document.title = obj.title;
    //             textarea.value = `# ${obj.title}|${obj.tag}

    // ${obj.content.trim()}
    //         `
    //         } catch (error) {
    //             console.log(error)
    //         }
    //     }
    const obj = await loadData();
    const md = new markdownit({
        linkify: true,
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(str, {language: lang}).value;
                } catch (__) {
                }
            }

            return ''; // use external default escaping
        }
    });
// https://github.com/cmaas/markdown-it-table-of-contents
toc(md, {
  "includeLevel": [2,3,4]
});
md.use(markdownItAnchor)
    wrapper.innerHTML = md.render(obj.content || obj);
}

function substringBetweenLast(string, start, end) {
    const startIndex = string.lastIndexOf(start);
    if (startIndex === -1) {
        return string;
    }
    const endIndex = string.indexOf(end, startIndex + start.length);

    return string.substring(startIndex + start.length, endIndex);

}

async function loadData() {
    const searchParams = new URL(window.location).searchParams;
    if (searchParams.has("path")) {
        const path = searchParams.get("path");
        document.title = substringBetweenLast(path, "\\", ".");
        const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`, {cache: "no-cache"});
        return res.text();
    } else {
        const id = searchParams.get("id");
        const res = await fetch(`/api/note?action=1&id=${id}`, {cache: "no-cache"});
        const obj = await res.json();
        document.title = obj.title;
        return obj;
    }
}

