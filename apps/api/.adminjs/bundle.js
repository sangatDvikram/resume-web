(function (require$$0, require$$1) {
	'use strict';

	function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

	var require$$0__default = /*#__PURE__*/_interopDefault(require$$0);
	var require$$1__default = /*#__PURE__*/_interopDefault(require$$1);

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var markdownEditor = {};

	var __createBinding$6 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  var desc = Object.getOwnPropertyDescriptor(m, k);
	  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	    desc = {
	      enumerable: true,
	      get: function () {
	        return m[k];
	      }
	    };
	  }
	  Object.defineProperty(o, k2, desc);
	} : function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  o[k2] = m[k];
	});
	var __setModuleDefault$6 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function (o, v) {
	  Object.defineProperty(o, "default", {
	    enumerable: true,
	    value: v
	  });
	} : function (o, v) {
	  o["default"] = v;
	});
	var __importStar$6 = commonjsGlobal && commonjsGlobal.__importStar || function () {
	  var ownKeys = function (o) {
	    ownKeys = Object.getOwnPropertyNames || function (o) {
	      var ar = [];
	      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	      return ar;
	    };
	    return ownKeys(o);
	  };
	  return function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding$6(result, mod, k[i]);
	    __setModuleDefault$6(result, mod);
	    return result;
	  };
	}();
	Object.defineProperty(markdownEditor, "__esModule", {
	  value: true
	});
	const react_1$6 = __importStar$6(require$$0__default.default);
	function esc(s) {
	  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}
	function renderMarkdown(raw) {
	  const saved = [];
	  let s = raw.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
	    saved.push(`<pre style="background:#0d1117;padding:12px;border-radius:6px;overflow:auto"><code>${esc(code.trim())}</code></pre>`);
	    return `\x00CB${saved.length - 1}\x00`;
	  });
	  s = s.replace(/`([^`\n]+)`/g, (_, c) => `<code style="background:#1e293b;padding:2px 6px;border-radius:4px;font-size:0.9em">${esc(c)}</code>`);
	  const lines = s.split('\n');
	  const out = [];
	  let listBuf = [];
	  let listType = 'ul';
	  const flushList = () => {
	    if (!listBuf.length) return;
	    out.push(`<${listType} style="padding-left:1.5em;margin:0.5em 0">${listBuf.join('')}</${listType}>`);
	    listBuf = [];
	  };
	  for (const line of lines) {
	    const h = line.match(/^(#{1,6})\s+(.+)/);
	    if (h) {
	      flushList();
	      out.push(`<h${h[1].length} style="margin:0.75em 0 0.25em">${h[2]}</h${h[1].length}>`);
	      continue;
	    }
	    const bq = line.match(/^>\s*(.*)/);
	    if (bq) {
	      flushList();
	      out.push(`<blockquote style="border-left:3px solid #6366f1;margin:0.5em 0;padding:4px 12px;color:#94a3b8">${bq[1]}</blockquote>`);
	      continue;
	    }
	    if (/^[-*_]{3,}$/.test(line.trim())) {
	      flushList();
	      out.push('<hr style="border:none;border-top:1px solid #334155;margin:1em 0">');
	      continue;
	    }
	    const ulm = line.match(/^(\s*)[-*+]\s+(.*)/);
	    const olm = line.match(/^(\s*)\d+\.\s+(.*)/);
	    if (ulm || olm) {
	      const type = ulm ? 'ul' : 'ol';
	      if (listBuf.length && type !== listType) flushList();
	      listType = type;
	      listBuf.push(`<li>${(ulm ?? olm)[2]}</li>`);
	      continue;
	    }
	    flushList();
	    out.push(line);
	  }
	  flushList();
	  s = out.join('\n');
	  s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
	  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
	  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
	  s = s.replace(/~~(.+?)~~/g, '<del>$1</del>');
	  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:6px;margin:0.5em 0">');
	  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#6366f1">$1</a>');
	  const sections = s.split(/\n\n+/);
	  s = sections.map(sec => {
	    const t = sec.trim();
	    if (!t) return '';
	    if (/^<(h[1-6]|ul|ol|pre|blockquote|hr|img)/.test(t) || t.startsWith('\x00CB')) return t;
	    return `<p style="margin:0.5em 0;line-height:1.7">${t.replace(/\n/g, '<br>')}</p>`;
	  }).join('\n');
	  saved.forEach((blk, i) => {
	    s = s.replace(`\x00CB${i}\x00`, blk);
	  });
	  return s;
	}
	const MarkdownEditor = ({
	  property,
	  record,
	  onChange
	}) => {
	  const fieldPath = property.path;
	  const initialValue = record?.params?.[fieldPath] ?? '';
	  const [value, setValue] = (0, react_1$6.useState)(initialValue);
	  const [preview, setPreview] = (0, react_1$6.useState)(() => renderMarkdown(initialValue));
	  const [uploading, setUploading] = (0, react_1$6.useState)(false);
	  const [activeTab, setActiveTab] = (0, react_1$6.useState)('split');
	  const textareaRef = (0, react_1$6.useRef)(null);
	  const fileInputRef = (0, react_1$6.useRef)(null);
	  const debounceRef = (0, react_1$6.useRef)(null);
	  (0, react_1$6.useEffect)(() => {
	    const v = record?.params?.[fieldPath] ?? '';
	    setValue(v);
	    setPreview(renderMarkdown(v));
	  }, [record?.id]);
	  const handleChange = (0, react_1$6.useCallback)(e => {
	    const v = e.target.value;
	    setValue(v);
	    onChange(fieldPath, v);
	    if (debounceRef.current) clearTimeout(debounceRef.current);
	    debounceRef.current = setTimeout(() => setPreview(renderMarkdown(v)), 300);
	  }, [fieldPath, onChange]);
	  const insertAtCursor = (0, react_1$6.useCallback)(text => {
	    const ta = textareaRef.current;
	    if (!ta) return;
	    const start = ta.selectionStart ?? value.length;
	    const end = ta.selectionEnd ?? value.length;
	    const next = value.slice(0, start) + text + value.slice(end);
	    setValue(next);
	    onChange(fieldPath, next);
	    setPreview(renderMarkdown(next));
	    setTimeout(() => {
	      ta.selectionStart = ta.selectionEnd = start + text.length;
	      ta.focus();
	    }, 0);
	  }, [value, fieldPath, onChange]);
	  const handleUpload = async e => {
	    const file = e.target.files?.[0];
	    if (!file) return;
	    setUploading(true);
	    try {
	      const fd = new FormData();
	      fd.append('file', file);
	      const res = await fetch('/v1/upload', {
	        method: 'POST',
	        body: fd,
	        credentials: 'include'
	      });
	      if (!res.ok) throw new Error(`HTTP ${res.status}`);
	      const {
	        url
	      } = await res.json();
	      insertAtCursor(`![${file.name.replace(/\.[^.]+$/, '')}](${url})`);
	    } catch (err) {
	      alert(`Image upload failed: ${err?.message ?? 'unknown error'}`);
	    } finally {
	      setUploading(false);
	      if (fileInputRef.current) fileInputRef.current.value = '';
	    }
	  };
	  const editorStyle = {
	    flex: 1,
	    fontFamily: '"Fira Code","Cascadia Code","JetBrains Mono",monospace',
	    fontSize: '13px',
	    lineHeight: '1.65',
	    padding: '12px',
	    border: '1px solid #334155',
	    borderRadius: '6px',
	    resize: 'none',
	    background: '#0f172a',
	    color: '#e2e8f0',
	    minHeight: '460px',
	    boxSizing: 'border-box',
	    overflowY: 'auto'
	  };
	  const previewStyle = {
	    flex: 1,
	    padding: '12px 16px',
	    border: '1px solid #334155',
	    borderRadius: '6px',
	    background: '#0f172a',
	    color: '#e2e8f0',
	    minHeight: '460px',
	    overflowY: 'auto',
	    fontSize: '14px',
	    lineHeight: '1.7',
	    boxSizing: 'border-box'
	  };
	  const tabBtn = active => ({
	    padding: '5px 14px',
	    fontSize: '12px',
	    fontWeight: 600,
	    cursor: 'pointer',
	    border: '1px solid #334155',
	    borderRadius: '5px',
	    background: active ? '#6366f1' : 'transparent',
	    color: active ? '#fff' : '#94a3b8'
	  });
	  const showEditor = activeTab !== 'preview';
	  const showPreview = activeTab !== 'editor';
	  return react_1$6.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: '8px'
	    }
	  }, react_1$6.default.createElement("div", {
	    style: {
	      display: 'flex',
	      gap: '6px',
	      alignItems: 'center',
	      flexWrap: 'wrap'
	    }
	  }, react_1$6.default.createElement("div", {
	    style: {
	      display: 'flex',
	      gap: '4px'
	    }
	  }, ['split', 'editor', 'preview'].map(t => react_1$6.default.createElement("button", {
	    key: t,
	    type: "button",
	    style: tabBtn(activeTab === t),
	    onClick: () => setActiveTab(t)
	  }, t === 'split' ? '⊟ Split' : t === 'editor' ? '✏ Editor' : '👁 Preview'))), react_1$6.default.createElement("div", {
	    style: {
	      flex: 1
	    }
	  }), [{
	    label: 'B',
	    title: 'Bold',
	    insert: '**bold**'
	  }, {
	    label: 'I',
	    title: 'Italic',
	    insert: '*italic*'
	  }, {
	    label: 'H',
	    title: 'Heading',
	    insert: '## Heading\n'
	  }, {
	    label: '`',
	    title: 'Inline code',
	    insert: '`code`'
	  }, {
	    label: '≡',
	    title: 'Code block',
	    insert: '```\ncode\n```\n'
	  }, {
	    label: '→',
	    title: 'Link',
	    insert: '[text](url)'
	  }].map(({
	    label,
	    title,
	    insert
	  }) => react_1$6.default.createElement("button", {
	    key: label,
	    type: "button",
	    title: title,
	    onClick: () => insertAtCursor(insert),
	    style: {
	      padding: '4px 10px',
	      fontSize: '12px',
	      fontWeight: 700,
	      border: '1px solid #334155',
	      borderRadius: '4px',
	      background: 'transparent',
	      color: '#94a3b8',
	      cursor: 'pointer'
	    }
	  }, label)), react_1$6.default.createElement("button", {
	    type: "button",
	    disabled: uploading,
	    onClick: () => fileInputRef.current?.click(),
	    style: {
	      padding: '5px 12px',
	      fontSize: '12px',
	      fontWeight: 600,
	      border: '1px solid #6366f1',
	      borderRadius: '4px',
	      background: uploading ? '#1e293b' : '#6366f120',
	      color: '#818cf8',
	      cursor: uploading ? 'not-allowed' : 'pointer'
	    }
	  }, uploading ? '⏳ Uploading…' : '📷 Image'), react_1$6.default.createElement("input", {
	    ref: fileInputRef,
	    type: "file",
	    accept: "image/*",
	    style: {
	      display: 'none'
	    },
	    onChange: handleUpload
	  })), react_1$6.default.createElement("div", {
	    style: {
	      display: 'flex',
	      gap: '8px'
	    }
	  }, showEditor && react_1$6.default.createElement("textarea", {
	    ref: textareaRef,
	    value: value,
	    onChange: handleChange,
	    spellCheck: false,
	    style: editorStyle,
	    placeholder: "Write Markdown here\u2026"
	  }), showPreview && react_1$6.default.createElement("div", {
	    style: previewStyle,
	    dangerouslySetInnerHTML: {
	      __html: preview || '<span style="color:#475569">Preview will appear here…</span>'
	    }
	  })), react_1$6.default.createElement("p", {
	    style: {
	      fontSize: '11px',
	      color: '#475569',
	      margin: 0
	    }
	  }, "GFM supported \u00B7 preview debounced 300 ms \u00B7 Ctrl+Z to undo"));
	};
	var _default$6 = markdownEditor.default = MarkdownEditor;

	var tagPicker = {};

	var __createBinding$5 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  var desc = Object.getOwnPropertyDescriptor(m, k);
	  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	    desc = {
	      enumerable: true,
	      get: function () {
	        return m[k];
	      }
	    };
	  }
	  Object.defineProperty(o, k2, desc);
	} : function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  o[k2] = m[k];
	});
	var __setModuleDefault$5 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function (o, v) {
	  Object.defineProperty(o, "default", {
	    enumerable: true,
	    value: v
	  });
	} : function (o, v) {
	  o["default"] = v;
	});
	var __importStar$5 = commonjsGlobal && commonjsGlobal.__importStar || function () {
	  var ownKeys = function (o) {
	    ownKeys = Object.getOwnPropertyNames || function (o) {
	      var ar = [];
	      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	      return ar;
	    };
	    return ownKeys(o);
	  };
	  return function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding$5(result, mod, k[i]);
	    __setModuleDefault$5(result, mod);
	    return result;
	  };
	}();
	Object.defineProperty(tagPicker, "__esModule", {
	  value: true
	});
	const react_1$5 = __importStar$5(require$$0__default.default);
	const adminjs_1$1 = require$$1__default.default;
	const api = new adminjs_1$1.ApiClient();
	const TagPicker = ({
	  property,
	  record,
	  onChange
	}) => {
	  const [allTags, setAllTags] = (0, react_1$5.useState)([]);
	  const [selected, setSelected] = (0, react_1$5.useState)([]);
	  const [query, setQuery] = (0, react_1$5.useState)('');
	  const [showDropdown, setShowDropdown] = (0, react_1$5.useState)(false);
	  const inputRef = (0, react_1$5.useRef)(null);
	  (0, react_1$5.useEffect)(() => {
	    fetch('/v1/blog/tags', {
	      credentials: 'include'
	    }).then(r => r.json()).then(tags => setAllTags(tags)).catch(() => {});
	    const params = record?.params ?? {};
	    const fromParams = [];
	    let i = 0;
	    while (params[`${property.path}.${i}.id`]) {
	      const id = params[`${property.path}.${i}.id`];
	      const name = params[`${property.path}.${i}.name`];
	      if (id && name) fromParams.push({
	        id,
	        name
	      });
	      i++;
	    }
	    const populated = record?.populated?.[property.path] ?? [];
	    const fromPopulated = populated.map(r => ({
	      id: r.params?.id,
	      name: r.params?.name
	    })).filter(t => t.id && t.name);
	    const seen = new Set();
	    const merged = [...fromParams, ...fromPopulated].filter(t => !seen.has(t.id) && seen.add(t.id));
	    setSelected(merged);
	  }, [record?.id]);
	  const emit = tags => {
	    onChange(property.path, tags.length > 0 ? tags.map(t => t.id) : ['__empty__']);
	  };
	  const addTag = tag => {
	    if (selected.some(s => s.id === tag.id)) return;
	    const next = [...selected, tag];
	    setSelected(next);
	    emit(next);
	    setQuery('');
	    setShowDropdown(false);
	  };
	  const removeTag = id => {
	    const next = selected.filter(t => t.id !== id);
	    setSelected(next);
	    emit(next);
	  };
	  const createTag = async () => {
	    const name = query.trim().toLowerCase();
	    if (!name) return;
	    const existing = allTags.find(t => t.name === name);
	    if (existing) {
	      addTag(existing);
	      return;
	    }
	    try {
	      const res = await api.resourceAction({
	        resourceId: 'Tag',
	        actionName: 'new',
	        data: {
	          name
	        }
	      });
	      const created = {
	        id: res.data?.record?.params?.id,
	        name: res.data?.record?.params?.name ?? name
	      };
	      setAllTags(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
	      addTag(created);
	    } catch {
	      alert(`Could not create tag "${name}". Please try again.`);
	    }
	  };
	  const filtered = allTags.filter(t => t.name.toLowerCase().includes(query.toLowerCase()) && !selected.some(s => s.id === t.id));
	  const chip = {
	    display: 'inline-flex',
	    alignItems: 'center',
	    gap: '4px',
	    padding: '3px 10px',
	    backgroundColor: '#3d5af1',
	    color: '#fff',
	    borderRadius: '20px',
	    fontSize: '12px',
	    fontWeight: 500
	  };
	  const removeBtn = {
	    background: 'none',
	    border: 'none',
	    color: '#fff',
	    cursor: 'pointer',
	    lineHeight: 1,
	    padding: '0 0 0 2px',
	    fontSize: '14px'
	  };
	  return react_1$5.default.createElement("div", {
	    style: {
	      position: 'relative'
	    }
	  }, react_1$5.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexWrap: 'wrap',
	      gap: '6px',
	      marginBottom: '8px',
	      minHeight: '28px'
	    }
	  }, selected.map(tag => react_1$5.default.createElement("span", {
	    key: tag.id,
	    style: chip
	  }, tag.name, react_1$5.default.createElement("button", {
	    type: "button",
	    style: removeBtn,
	    onClick: () => removeTag(tag.id)
	  }, "\u00D7")))), react_1$5.default.createElement("div", {
	    style: {
	      display: 'flex',
	      gap: '6px'
	    }
	  }, react_1$5.default.createElement("input", {
	    ref: inputRef,
	    type: "text",
	    value: query,
	    onChange: e => {
	      setQuery(e.target.value);
	      setShowDropdown(true);
	    },
	    onFocus: () => setShowDropdown(true),
	    onBlur: () => setTimeout(() => setShowDropdown(false), 200),
	    onKeyDown: e => {
	      if (e.key === 'Enter') {
	        e.preventDefault();
	        createTag();
	      }
	    },
	    placeholder: "Search or create a tag\u2026",
	    style: {
	      flex: 1,
	      padding: '7px 11px',
	      border: '1px solid #4a4a6a',
	      borderRadius: '5px',
	      fontSize: '13px',
	      backgroundColor: '#1a1a2e',
	      color: '#e0e0e0'
	    }
	  }), query.trim() && react_1$5.default.createElement("button", {
	    type: "button",
	    onClick: createTag,
	    style: {
	      padding: '7px 14px',
	      backgroundColor: '#22c55e',
	      color: '#fff',
	      border: 'none',
	      borderRadius: '5px',
	      cursor: 'pointer',
	      fontSize: '13px',
	      fontWeight: 500
	    }
	  }, "+ Add")), showDropdown && filtered.length > 0 && react_1$5.default.createElement("ul", {
	    style: {
	      position: 'absolute',
	      top: '100%',
	      left: 0,
	      right: 0,
	      zIndex: 9999,
	      backgroundColor: '#fff',
	      border: '1px solid #ccc',
	      borderRadius: '5px',
	      listStyle: 'none',
	      margin: '2px 0',
	      padding: 0,
	      maxHeight: '200px',
	      overflowY: 'auto',
	      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
	    }
	  }, filtered.map(tag => react_1$5.default.createElement("li", {
	    key: tag.id,
	    onMouseDown: () => addTag(tag),
	    style: {
	      padding: '8px 12px',
	      cursor: 'pointer',
	      fontSize: '13px',
	      color: '#333'
	    }
	  }, tag.name))), react_1$5.default.createElement("p", {
	    style: {
	      fontSize: '11px',
	      color: '#888',
	      margin: '6px 0 0'
	    }
	  }, "Type to search existing tags \u00B7 press Enter or click \"+ Add\" to create new"));
	};
	var _default$5 = tagPicker.default = TagPicker;

	var skillPicker = {};

	var __createBinding$4 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  var desc = Object.getOwnPropertyDescriptor(m, k);
	  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	    desc = {
	      enumerable: true,
	      get: function () {
	        return m[k];
	      }
	    };
	  }
	  Object.defineProperty(o, k2, desc);
	} : function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  o[k2] = m[k];
	});
	var __setModuleDefault$4 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function (o, v) {
	  Object.defineProperty(o, "default", {
	    enumerable: true,
	    value: v
	  });
	} : function (o, v) {
	  o["default"] = v;
	});
	var __importStar$4 = commonjsGlobal && commonjsGlobal.__importStar || function () {
	  var ownKeys = function (o) {
	    ownKeys = Object.getOwnPropertyNames || function (o) {
	      var ar = [];
	      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	      return ar;
	    };
	    return ownKeys(o);
	  };
	  return function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding$4(result, mod, k[i]);
	    __setModuleDefault$4(result, mod);
	    return result;
	  };
	}();
	Object.defineProperty(skillPicker, "__esModule", {
	  value: true
	});
	var _default$4 = skillPicker.default = SkillPicker;
	const react_1$4 = __importStar$4(require$$0__default.default);
	function SkillPicker({
	  property,
	  record,
	  onChange
	}) {
	  const [skills, setSkills] = (0, react_1$4.useState)([]);
	  const [query, setQuery] = (0, react_1$4.useState)('');
	  const [selected, setSelected] = (0, react_1$4.useState)([]);
	  const [loading, setLoading] = (0, react_1$4.useState)(false);
	  (0, react_1$4.useEffect)(() => {
	    const ids = [];
	    Object.entries(record.params ?? {}).forEach(([key, val]) => {
	      if (key.startsWith(`${property.path}.`) && key.endsWith('.id')) {
	        ids.push(val);
	      }
	    });
	    const populated = (record.populated ?? {})[property.path];
	    if (populated) {
	      ids.push(...populated.map(s => s.params?.id ?? s.id).filter(Boolean));
	    }
	    setSelected([...new Set(ids)]);
	  }, []);
	  (0, react_1$4.useEffect)(() => {
	    setLoading(true);
	    const base = window.__API_BASE__ ?? `${window.location.protocol}//${window.location.hostname}:3001`;
	    fetch(`${base}/v1/resume`).then(r => r.json()).then(data => setSkills(data?.skills ?? [])).catch(() => {}).finally(() => setLoading(false));
	  }, []);
	  const toggle = (0, react_1$4.useCallback)(id => {
	    setSelected(prev => {
	      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
	      onChange(property.path, next.length > 0 ? next : ['__empty__']);
	      return next;
	    });
	  }, [onChange, property.path]);
	  const filtered = query ? skills.filter(s => s.name.toLowerCase().includes(query.toLowerCase())) : skills;
	  const categories = [...new Set(filtered.map(s => s.category))].sort();
	  return react_1$4.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 8
	    }
	  }, react_1$4.default.createElement("label", {
	    style: {
	      fontSize: 12,
	      fontWeight: 600,
	      textTransform: 'uppercase',
	      letterSpacing: 1,
	      opacity: 0.7
	    }
	  }, property.label), selected.length > 0 && react_1$4.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexWrap: 'wrap',
	      gap: 4
	    }
	  }, selected.map(id => {
	    const sk = skills.find(s => s.id === id);
	    return sk ? react_1$4.default.createElement("span", {
	      key: id,
	      style: {
	        padding: '2px 8px',
	        borderRadius: 4,
	        fontSize: 11,
	        fontWeight: 500,
	        background: 'rgba(99,102,241,0.15)',
	        border: '1px solid rgba(99,102,241,0.35)',
	        display: 'flex',
	        alignItems: 'center',
	        gap: 4,
	        cursor: 'pointer'
	      },
	      onClick: () => toggle(id)
	    }, sk.name, " \u2715") : null;
	  })), react_1$4.default.createElement("input", {
	    type: "text",
	    placeholder: "Filter skills...",
	    value: query,
	    onChange: e => setQuery(e.target.value),
	    style: {
	      width: '100%',
	      padding: '6px 10px',
	      borderRadius: 6,
	      border: '1px solid rgba(128,128,128,0.3)',
	      background: 'transparent',
	      fontSize: 13,
	      color: 'inherit',
	      boxSizing: 'border-box'
	    }
	  }), loading && react_1$4.default.createElement("span", {
	    style: {
	      fontSize: 12,
	      opacity: 0.6
	    }
	  }, "Loading skills\u2026"), react_1$4.default.createElement("div", {
	    style: {
	      maxHeight: 220,
	      overflowY: 'auto',
	      border: '1px solid rgba(128,128,128,0.2)',
	      borderRadius: 6,
	      padding: 8
	    }
	  }, categories.map(cat => react_1$4.default.createElement("div", {
	    key: cat,
	    style: {
	      marginBottom: 10
	    }
	  }, react_1$4.default.createElement("div", {
	    style: {
	      fontSize: 10,
	      fontWeight: 700,
	      textTransform: 'uppercase',
	      letterSpacing: 1,
	      opacity: 0.5,
	      marginBottom: 4
	    }
	  }, cat), filtered.filter(s => s.category === cat).map(skill => react_1$4.default.createElement("label", {
	    key: skill.id,
	    style: {
	      display: 'flex',
	      alignItems: 'center',
	      gap: 6,
	      fontSize: 13,
	      cursor: 'pointer',
	      padding: '2px 0'
	    }
	  }, react_1$4.default.createElement("input", {
	    type: "checkbox",
	    checked: selected.includes(skill.id),
	    onChange: () => toggle(skill.id),
	    style: {
	      width: 14,
	      height: 14
	    }
	  }), skill.name)))), filtered.length === 0 && !loading && react_1$4.default.createElement("span", {
	    style: {
	      fontSize: 12,
	      opacity: 0.5
	    }
	  }, "No skills found.")));
	}

	var mediaUploader = {};

	var __createBinding$3 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  var desc = Object.getOwnPropertyDescriptor(m, k);
	  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	    desc = {
	      enumerable: true,
	      get: function () {
	        return m[k];
	      }
	    };
	  }
	  Object.defineProperty(o, k2, desc);
	} : function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  o[k2] = m[k];
	});
	var __setModuleDefault$3 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function (o, v) {
	  Object.defineProperty(o, "default", {
	    enumerable: true,
	    value: v
	  });
	} : function (o, v) {
	  o["default"] = v;
	});
	var __importStar$3 = commonjsGlobal && commonjsGlobal.__importStar || function () {
	  var ownKeys = function (o) {
	    ownKeys = Object.getOwnPropertyNames || function (o) {
	      var ar = [];
	      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	      return ar;
	    };
	    return ownKeys(o);
	  };
	  return function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding$3(result, mod, k[i]);
	    __setModuleDefault$3(result, mod);
	    return result;
	  };
	}();
	Object.defineProperty(mediaUploader, "__esModule", {
	  value: true
	});
	var _default$3 = mediaUploader.default = MediaUploader;
	const react_1$3 = __importStar$3(require$$0__default.default);
	function MediaUploader({
	  property,
	  record,
	  onChange
	}) {
	  const apiBase = window.__API_BASE__ ?? `${window.location.protocol}//${window.location.hostname}:3001`;
	  const initial = [];
	  if (record?.params) {
	    let i = 0;
	    while (record.params[`${property.path}.${i}.url`]) {
	      initial.push({
	        id: record.params[`${property.path}.${i}.id`] ?? undefined,
	        url: record.params[`${property.path}.${i}.url`],
	        altText: record.params[`${property.path}.${i}.altText`] ?? ''
	      });
	      i++;
	    }
	  }
	  const [items, setItems] = (0, react_1$3.useState)(initial);
	  const [dragging, setDragging] = (0, react_1$3.useState)(false);
	  const dragIdx = (0, react_1$3.useRef)(null);
	  const fileRef = (0, react_1$3.useRef)(null);
	  const emit = (0, react_1$3.useCallback)(next => {
	    setItems(next);
	    onChange(property.path, next.filter(m => !m.uploading && !m.error));
	  }, [onChange, property.path]);
	  const uploadFiles = async files => {
	    if (!files || !files.length) return;
	    const placeholders = Array.from(files).map(f => ({
	      url: URL.createObjectURL(f),
	      altText: '',
	      uploading: true
	    }));
	    setItems(prev => [...prev, ...placeholders]);
	    for (let i = 0; i < files.length; i++) {
	      const file = files[i];
	      const fd = new FormData();
	      fd.append('file', file);
	      try {
	        const res = await fetch(`${apiBase}/v1/upload`, {
	          method: 'POST',
	          body: fd,
	          credentials: 'include'
	        });
	        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
	        const {
	          url
	        } = await res.json();
	        setItems(prev => {
	          const next = [...prev];
	          const idx = next.findIndex(m => m.uploading && m.url === placeholders[i].url);
	          if (idx !== -1) next[idx] = {
	            url,
	            altText: '',
	            uploading: false
	          };
	          onChange(property.path, next.filter(m => !m.uploading));
	          return next;
	        });
	      } catch (err) {
	        setItems(prev => {
	          const next = [...prev];
	          const idx = next.findIndex(m => m.uploading && m.url === placeholders[i].url);
	          if (idx !== -1) next[idx] = {
	            ...next[idx],
	            uploading: false,
	            error: err.message
	          };
	          return next;
	        });
	      }
	    }
	  };
	  const onDragStart = i => {
	    dragIdx.current = i;
	  };
	  const onDragOver = (e, i) => {
	    e.preventDefault();
	    if (dragIdx.current === null || dragIdx.current === i) return;
	    setItems(prev => {
	      const next = [...prev];
	      const [moved] = next.splice(dragIdx.current, 1);
	      next.splice(i, 0, moved);
	      dragIdx.current = i;
	      onChange(property.path, next.filter(m => !m.uploading));
	      return next;
	    });
	  };
	  const onDropZone = e => {
	    e.preventDefault();
	    setDragging(false);
	    uploadFiles(e.dataTransfer.files);
	  };
	  return react_1$3.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 12
	    }
	  }, react_1$3.default.createElement("div", {
	    onDragOver: e => {
	      e.preventDefault();
	      setDragging(true);
	    },
	    onDragLeave: () => setDragging(false),
	    onDrop: onDropZone,
	    onClick: () => fileRef.current?.click(),
	    style: {
	      border: `2px dashed ${dragging ? '#818cf8' : 'rgba(128,128,128,0.3)'}`,
	      borderRadius: 8,
	      padding: '24px 16px',
	      textAlign: 'center',
	      cursor: 'pointer',
	      background: dragging ? 'rgba(99,102,241,0.05)' : 'transparent',
	      transition: 'all 150ms'
	    }
	  }, react_1$3.default.createElement("span", {
	    style: {
	      fontSize: 13,
	      opacity: 0.7
	    }
	  }, "Drop images here or ", react_1$3.default.createElement("strong", null, "click to browse")), react_1$3.default.createElement("input", {
	    ref: fileRef,
	    type: "file",
	    multiple: true,
	    accept: "image/*",
	    style: {
	      display: 'none'
	    },
	    onChange: e => uploadFiles(e.target.files)
	  })), items.length > 0 && react_1$3.default.createElement("div", {
	    style: {
	      display: 'grid',
	      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
	      gap: 8
	    }
	  }, items.map((item, i) => react_1$3.default.createElement("div", {
	    key: i,
	    draggable: !item.uploading,
	    onDragStart: () => onDragStart(i),
	    onDragOver: e => onDragOver(e, i),
	    style: {
	      position: 'relative',
	      borderRadius: 8,
	      overflow: 'hidden',
	      border: '1px solid rgba(128,128,128,0.2)',
	      cursor: item.uploading ? 'default' : 'grab',
	      opacity: item.uploading ? 0.6 : 1
	    }
	  }, react_1$3.default.createElement("img", {
	    src: item.url,
	    alt: item.altText,
	    style: {
	      width: '100%',
	      height: 80,
	      objectFit: 'cover',
	      display: 'block'
	    }
	  }), item.uploading && react_1$3.default.createElement("div", {
	    style: {
	      position: 'absolute',
	      inset: 0,
	      display: 'flex',
	      alignItems: 'center',
	      justifyContent: 'center',
	      background: 'rgba(0,0,0,0.4)',
	      fontSize: 10,
	      color: '#fff'
	    }
	  }, "Uploading\u2026"), item.error && react_1$3.default.createElement("div", {
	    style: {
	      position: 'absolute',
	      inset: 0,
	      background: 'rgba(220,38,38,0.7)',
	      fontSize: 9,
	      color: '#fff',
	      padding: 4,
	      overflow: 'hidden'
	    }
	  }, item.error), !item.uploading && react_1$3.default.createElement(react_1$3.default.Fragment, null, react_1$3.default.createElement("input", {
	    type: "text",
	    placeholder: "Alt text",
	    value: item.altText,
	    onChange: e => emit(items.map((it, j) => j === i ? {
	      ...it,
	      altText: e.target.value
	    } : it)),
	    style: {
	      width: '100%',
	      fontSize: 10,
	      padding: '3px 6px',
	      border: 'none',
	      borderTop: '1px solid rgba(128,128,128,0.2)',
	      background: 'transparent',
	      boxSizing: 'border-box'
	    }
	  }), react_1$3.default.createElement("button", {
	    onClick: () => emit(items.filter((_, j) => j !== i)),
	    style: {
	      position: 'absolute',
	      top: 4,
	      right: 4,
	      background: 'rgba(220,38,38,0.8)',
	      border: 'none',
	      borderRadius: 4,
	      color: '#fff',
	      fontSize: 10,
	      cursor: 'pointer',
	      padding: '1px 5px'
	    },
	    title: "Remove"
	  }, "\u2715"))))));
	}

	var videoManager = {};

	var __createBinding$2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  var desc = Object.getOwnPropertyDescriptor(m, k);
	  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	    desc = {
	      enumerable: true,
	      get: function () {
	        return m[k];
	      }
	    };
	  }
	  Object.defineProperty(o, k2, desc);
	} : function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  o[k2] = m[k];
	});
	var __setModuleDefault$2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function (o, v) {
	  Object.defineProperty(o, "default", {
	    enumerable: true,
	    value: v
	  });
	} : function (o, v) {
	  o["default"] = v;
	});
	var __importStar$2 = commonjsGlobal && commonjsGlobal.__importStar || function () {
	  var ownKeys = function (o) {
	    ownKeys = Object.getOwnPropertyNames || function (o) {
	      var ar = [];
	      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	      return ar;
	    };
	    return ownKeys(o);
	  };
	  return function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding$2(result, mod, k[i]);
	    __setModuleDefault$2(result, mod);
	    return result;
	  };
	}();
	Object.defineProperty(videoManager, "__esModule", {
	  value: true
	});
	var _default$2 = videoManager.default = VideoManager;
	const react_1$2 = __importStar$2(require$$0__default.default);
	function detectSource(url) {
	  if (/youtu(\.be|be\.com)/i.test(url)) return 'youtube';
	  if (/vimeo\.com/i.test(url)) return 'vimeo';
	  return 'self_hosted';
	}
	function VideoManager({
	  property,
	  record,
	  onChange
	}) {
	  const initial = [];
	  if (record?.params) {
	    let i = 0;
	    while (record.params[`${property.path}.${i}.url`]) {
	      initial.push({
	        id: record.params[`${property.path}.${i}.id`] ?? undefined,
	        source: record.params[`${property.path}.${i}.source`] ?? 'self_hosted',
	        url: record.params[`${property.path}.${i}.url`],
	        title: record.params[`${property.path}.${i}.title`] ?? ''
	      });
	      i++;
	    }
	  }
	  const [items, setItems] = (0, react_1$2.useState)(initial);
	  const [newUrl, setNewUrl] = (0, react_1$2.useState)('');
	  const [newTitle, setNewTitle] = (0, react_1$2.useState)('');
	  const dragIdx = (0, react_1$2.useRef)(null);
	  const emit = (0, react_1$2.useCallback)(next => {
	    setItems(next);
	    onChange(property.path, next);
	  }, [onChange, property.path]);
	  const addItem = () => {
	    const url = newUrl.trim();
	    if (!url) return;
	    const item = {
	      source: detectSource(url),
	      url,
	      title: newTitle.trim()
	    };
	    emit([...items, item]);
	    setNewUrl('');
	    setNewTitle('');
	  };
	  const onDragStart = i => {
	    dragIdx.current = i;
	  };
	  const onDragOver = (e, i) => {
	    e.preventDefault();
	    if (dragIdx.current === null || dragIdx.current === i) return;
	    const next = [...items];
	    const [moved] = next.splice(dragIdx.current, 1);
	    next.splice(i, 0, moved);
	    dragIdx.current = i;
	    emit(next);
	  };
	  const labelStyle = {
	    fontSize: 10,
	    fontWeight: 700,
	    textTransform: 'uppercase',
	    letterSpacing: 1,
	    opacity: 0.5,
	    marginBottom: 4
	  };
	  const inputStyle = {
	    width: '100%',
	    padding: '6px 10px',
	    borderRadius: 6,
	    border: '1px solid rgba(128,128,128,0.3)',
	    background: 'transparent',
	    fontSize: 13,
	    color: 'inherit',
	    boxSizing: 'border-box'
	  };
	  return react_1$2.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 12
	    }
	  }, react_1$2.default.createElement("label", {
	    style: {
	      fontSize: 12,
	      fontWeight: 600,
	      textTransform: 'uppercase',
	      letterSpacing: 1,
	      opacity: 0.7
	    }
	  }, property.path.charAt(0).toUpperCase() + property.path.slice(1)), react_1$2.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 6,
	      padding: 12,
	      borderRadius: 8,
	      border: '1px solid rgba(128,128,128,0.2)'
	    }
	  }, react_1$2.default.createElement("div", {
	    style: labelStyle
	  }, "Add video"), react_1$2.default.createElement("input", {
	    type: "url",
	    placeholder: "YouTube, Vimeo, or MP4 URL",
	    value: newUrl,
	    onChange: e => setNewUrl(e.target.value),
	    onKeyDown: e => e.key === 'Enter' && addItem(),
	    style: inputStyle
	  }), react_1$2.default.createElement("input", {
	    type: "text",
	    placeholder: "Title (optional)",
	    value: newTitle,
	    onChange: e => setNewTitle(e.target.value),
	    onKeyDown: e => e.key === 'Enter' && addItem(),
	    style: inputStyle
	  }), react_1$2.default.createElement("button", {
	    onClick: addItem,
	    style: {
	      alignSelf: 'flex-start',
	      padding: '6px 14px',
	      borderRadius: 6,
	      border: 'none',
	      cursor: 'pointer',
	      background: '#6366f1',
	      color: '#fff',
	      fontSize: 12,
	      fontWeight: 600
	    }
	  }, "+ Add")), items.length > 0 && react_1$2.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 6
	    }
	  }, items.map((item, i) => react_1$2.default.createElement("div", {
	    key: i,
	    draggable: true,
	    onDragStart: () => onDragStart(i),
	    onDragOver: e => onDragOver(e, i),
	    style: {
	      display: 'flex',
	      alignItems: 'center',
	      gap: 8,
	      padding: '8px 10px',
	      borderRadius: 8,
	      border: '1px solid rgba(128,128,128,0.2)',
	      cursor: 'grab'
	    }
	  }, react_1$2.default.createElement("span", {
	    style: {
	      fontSize: 9,
	      padding: '2px 6px',
	      borderRadius: 4,
	      fontWeight: 700,
	      background: item.source === 'youtube' ? 'rgba(220,38,38,0.15)' : item.source === 'vimeo' ? 'rgba(14,165,233,0.15)' : 'rgba(99,102,241,0.15)',
	      color: item.source === 'youtube' ? '#dc2626' : item.source === 'vimeo' ? '#0ea5e9' : '#6366f1',
	      textTransform: 'uppercase',
	      letterSpacing: 1,
	      flexShrink: 0
	    }
	  }, item.source.replace('_', ' ')), react_1$2.default.createElement("div", {
	    style: {
	      flex: 1,
	      overflow: 'hidden'
	    }
	  }, react_1$2.default.createElement("div", {
	    style: {
	      fontSize: 12,
	      fontWeight: 500,
	      whiteSpace: 'nowrap',
	      overflow: 'hidden',
	      textOverflow: 'ellipsis'
	    }
	  }, item.title || item.url), item.title && react_1$2.default.createElement("div", {
	    style: {
	      fontSize: 10,
	      opacity: 0.5,
	      whiteSpace: 'nowrap',
	      overflow: 'hidden',
	      textOverflow: 'ellipsis'
	    }
	  }, item.url)), react_1$2.default.createElement("input", {
	    type: "text",
	    placeholder: "Title",
	    value: item.title,
	    onChange: e => emit(items.map((it, j) => j === i ? {
	      ...it,
	      title: e.target.value
	    } : it)),
	    style: {
	      ...inputStyle,
	      width: 120,
	      flexShrink: 0
	    }
	  }), react_1$2.default.createElement("button", {
	    onClick: () => emit(items.filter((_, j) => j !== i)),
	    style: {
	      flexShrink: 0,
	      background: 'rgba(220,38,38,0.15)',
	      border: 'none',
	      borderRadius: 4,
	      color: '#dc2626',
	      fontSize: 11,
	      cursor: 'pointer',
	      padding: '3px 7px'
	    }
	  }, "\u2715"), react_1$2.default.createElement("span", {
	    style: {
	      flexShrink: 0,
	      opacity: 0.3,
	      fontSize: 14,
	      cursor: 'grab'
	    }
	  }, "\u283F")))));
	}

	var photoUploader = {};

	var __createBinding$1 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  var desc = Object.getOwnPropertyDescriptor(m, k);
	  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	    desc = {
	      enumerable: true,
	      get: function () {
	        return m[k];
	      }
	    };
	  }
	  Object.defineProperty(o, k2, desc);
	} : function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  o[k2] = m[k];
	});
	var __setModuleDefault$1 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function (o, v) {
	  Object.defineProperty(o, "default", {
	    enumerable: true,
	    value: v
	  });
	} : function (o, v) {
	  o["default"] = v;
	});
	var __importStar$1 = commonjsGlobal && commonjsGlobal.__importStar || function () {
	  var ownKeys = function (o) {
	    ownKeys = Object.getOwnPropertyNames || function (o) {
	      var ar = [];
	      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	      return ar;
	    };
	    return ownKeys(o);
	  };
	  return function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding$1(result, mod, k[i]);
	    __setModuleDefault$1(result, mod);
	    return result;
	  };
	}();
	Object.defineProperty(photoUploader, "__esModule", {
	  value: true
	});
	var _default$1 = photoUploader.default = PhotoUploader;
	const react_1$1 = __importStar$1(require$$0__default.default);
	function PhotoUploader({
	  property,
	  record,
	  onChange
	}) {
	  const apiBase = window.__API_BASE__ ?? `${window.location.protocol}//${window.location.hostname}:3001`;
	  const existingUrl = record?.params?.[property.path] ?? '';
	  const [items, setItems] = (0, react_1$1.useState)([]);
	  const [dragging, setDragging] = (0, react_1$1.useState)(false);
	  const fileRef = (0, react_1$1.useRef)(null);
	  const update = (0, react_1$1.useCallback)((idx, patch) => setItems(prev => prev.map((it, i) => i === idx ? {
	    ...it,
	    ...patch
	  } : it)), []);
	  const uploadOne = (0, react_1$1.useCallback)(async (item, idx) => {
	    update(idx, {
	      state: 'uploading',
	      progress: 0
	    });
	    const fd = new FormData();
	    fd.append('file', item.file);
	    try {
	      const xhr = new XMLHttpRequest();
	      await new Promise((resolve, reject) => {
	        xhr.upload.addEventListener('progress', e => {
	          if (e.lengthComputable) {
	            update(idx, {
	              progress: Math.round(e.loaded / e.total * 90)
	            });
	          }
	        });
	        xhr.addEventListener('load', () => {
	          if (xhr.status >= 200 && xhr.status < 300) {
	            try {
	              const data = JSON.parse(xhr.responseText);
	              update(idx, {
	                state: 'done',
	                progress: 100,
	                resultUrl: data.originalUrl
	              });
	              onChange(property.path, data.originalUrl);
	              resolve();
	            } catch {
	              reject(new Error('Invalid JSON response'));
	            }
	          } else {
	            reject(new Error(`Upload failed: HTTP ${xhr.status}`));
	          }
	        });
	        xhr.addEventListener('error', () => reject(new Error('Network error')));
	        xhr.open('POST', `${apiBase}/v1/gallery/photos/upload`);
	        xhr.withCredentials = true;
	        xhr.send(fd);
	      });
	    } catch (err) {
	      update(idx, {
	        state: 'error',
	        error: err.message
	      });
	    }
	  }, [apiBase, onChange, property.path, update]);
	  const addFiles = (0, react_1$1.useCallback)(fileList => {
	    if (!fileList) return;
	    const allowed = Math.min(fileList.length, 50 - items.length);
	    const newItems = Array.from(fileList).slice(0, allowed).map(f => ({
	      file: f,
	      localUrl: URL.createObjectURL(f),
	      state: 'pending',
	      progress: 0
	    }));
	    setItems(prev => {
	      const next = [...prev, ...newItems];
	      newItems.forEach((it, i) => void uploadOne(it, prev.length + i));
	      return next;
	    });
	  }, [items.length, uploadOne]);
	  const stateColor = {
	    pending: '#6b7280',
	    uploading: '#6366f1',
	    done: '#22c55e',
	    error: '#ef4444'
	  };
	  return react_1$1.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 12
	    }
	  }, existingUrl && react_1$1.default.createElement("img", {
	    src: existingUrl,
	    alt: "Current",
	    style: {
	      width: 120,
	      height: 80,
	      objectFit: 'cover',
	      borderRadius: 6,
	      border: '1px solid rgba(128,128,128,0.2)'
	    }
	  }), items.length < 50 && react_1$1.default.createElement("div", {
	    onDragOver: e => {
	      e.preventDefault();
	      setDragging(true);
	    },
	    onDragLeave: () => setDragging(false),
	    onDrop: e => {
	      e.preventDefault();
	      setDragging(false);
	      addFiles(e.dataTransfer.files);
	    },
	    onClick: () => fileRef.current?.click(),
	    style: {
	      border: `2px dashed ${dragging ? '#818cf8' : 'rgba(128,128,128,0.3)'}`,
	      borderRadius: 8,
	      padding: '20px 16px',
	      textAlign: 'center',
	      cursor: 'pointer',
	      background: dragging ? 'rgba(99,102,241,0.05)' : 'transparent'
	    }
	  }, react_1$1.default.createElement("span", {
	    style: {
	      fontSize: 13,
	      opacity: 0.7
	    }
	  }, "Drop photos here or ", react_1$1.default.createElement("strong", null, "click to browse"), " (max 50)"), react_1$1.default.createElement("input", {
	    ref: fileRef,
	    type: "file",
	    multiple: true,
	    accept: "image/jpeg,image/png,image/webp,image/gif",
	    style: {
	      display: 'none'
	    },
	    onChange: e => addFiles(e.target.files)
	  })), items.length > 0 && react_1$1.default.createElement("div", {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 8
	    }
	  }, items.map((item, i) => react_1$1.default.createElement("div", {
	    key: i,
	    style: {
	      display: 'flex',
	      alignItems: 'center',
	      gap: 10
	    }
	  }, react_1$1.default.createElement("img", {
	    src: item.resultUrl ?? item.localUrl,
	    alt: item.file.name,
	    style: {
	      width: 48,
	      height: 36,
	      objectFit: 'cover',
	      borderRadius: 4,
	      flexShrink: 0
	    }
	  }), react_1$1.default.createElement("div", {
	    style: {
	      flex: 1,
	      minWidth: 0
	    }
	  }, react_1$1.default.createElement("div", {
	    style: {
	      fontSize: 11,
	      opacity: 0.8,
	      whiteSpace: 'nowrap',
	      overflow: 'hidden',
	      textOverflow: 'ellipsis'
	    }
	  }, item.file.name), react_1$1.default.createElement("div", {
	    style: {
	      height: 4,
	      borderRadius: 2,
	      background: 'rgba(128,128,128,0.2)',
	      marginTop: 4
	    }
	  }, react_1$1.default.createElement("div", {
	    style: {
	      height: '100%',
	      borderRadius: 2,
	      width: `${item.progress}%`,
	      background: stateColor[item.state],
	      transition: 'width 0.15s ease'
	    }
	  })), item.error && react_1$1.default.createElement("div", {
	    style: {
	      fontSize: 10,
	      color: '#ef4444',
	      marginTop: 2
	    }
	  }, item.error)), react_1$1.default.createElement("span", {
	    style: {
	      fontSize: 10,
	      color: stateColor[item.state],
	      flexShrink: 0
	    }
	  }, item.state === 'uploading' ? `${item.progress}%` : item.state)))));
	}

	var dashboard = {};

	var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  var desc = Object.getOwnPropertyDescriptor(m, k);
	  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	    desc = {
	      enumerable: true,
	      get: function () {
	        return m[k];
	      }
	    };
	  }
	  Object.defineProperty(o, k2, desc);
	} : function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  o[k2] = m[k];
	});
	var __setModuleDefault = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function (o, v) {
	  Object.defineProperty(o, "default", {
	    enumerable: true,
	    value: v
	  });
	} : function (o, v) {
	  o["default"] = v;
	});
	var __importStar = commonjsGlobal && commonjsGlobal.__importStar || function () {
	  var ownKeys = function (o) {
	    ownKeys = Object.getOwnPropertyNames || function (o) {
	      var ar = [];
	      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	      return ar;
	    };
	    return ownKeys(o);
	  };
	  return function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
	    __setModuleDefault(result, mod);
	    return result;
	  };
	}();
	Object.defineProperty(dashboard, "__esModule", {
	  value: true
	});
	const react_1 = __importStar(require$$0__default.default);
	const adminjs_1 = require$$1__default.default;
	const INITIAL = {
	  publishedPosts: '–',
	  draftPosts: '–',
	  projects: '–',
	  photos: '–',
	  albums: '–'
	};
	const CARDS = [{
	  key: 'publishedPosts',
	  label: 'Published Posts',
	  icon: '📝',
	  accent: '#6366f1'
	}, {
	  key: 'draftPosts',
	  label: 'Draft Posts',
	  icon: '✏️',
	  accent: '#f59e0b'
	}, {
	  key: 'projects',
	  label: 'Projects',
	  icon: '🚀',
	  accent: '#22c55e'
	}, {
	  key: 'photos',
	  label: 'Photos',
	  icon: '📷',
	  accent: '#3b82f6'
	}, {
	  key: 'albums',
	  label: 'Albums',
	  icon: '🗂️',
	  accent: '#a855f7'
	}];
	const Dashboard = () => {
	  const [stats, setStats] = (0, react_1.useState)(INITIAL);
	  const [loading, setLoading] = (0, react_1.useState)(true);
	  const [error, setError] = (0, react_1.useState)(null);
	  (0, react_1.useEffect)(() => {
	    const api = new adminjs_1.ApiClient();
	    async function load() {
	      try {
	        const [pubPostsRes, allPostsRes, projectsRes, photosRes, albumsRes] = await Promise.allSettled([fetch('/v1/blog', {
	          credentials: 'include'
	        }).then(r => r.json()), api.resourceAction({
	          resourceId: 'BlogPost',
	          actionName: 'list',
	          params: {
	            perPage: 1
	          }
	        }), fetch('/v1/projects', {
	          credentials: 'include'
	        }).then(r => r.json()), fetch('/v1/gallery/photos', {
	          credentials: 'include'
	        }).then(r => r.json()), fetch('/v1/gallery/albums', {
	          credentials: 'include'
	        }).then(r => r.json())]);
	        const publishedPosts = pubPostsRes.status === 'fulfilled' ? pubPostsRes.value.length : '–';
	        const totalPosts = allPostsRes.status === 'fulfilled' ? allPostsRes.value?.data?.meta?.total ?? '–' : '–';
	        const draftPosts = typeof totalPosts === 'number' && typeof publishedPosts === 'number' ? totalPosts - publishedPosts : '–';
	        const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.length : '–';
	        const photos = photosRes.status === 'fulfilled' ? photosRes.value?.total ?? '–' : '–';
	        const albums = albumsRes.status === 'fulfilled' ? albumsRes.value.length : '–';
	        setStats({
	          publishedPosts,
	          draftPosts,
	          projects,
	          photos,
	          albums
	        });
	      } catch (e) {
	        setError(e?.message ?? 'Failed to load stats');
	      } finally {
	        setLoading(false);
	      }
	    }
	    void load();
	  }, []);
	  const hour = new Date().getHours();
	  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
	  return react_1.default.createElement("div", {
	    style: {
	      padding: '32px',
	      fontFamily: 'system-ui, sans-serif'
	    }
	  }, react_1.default.createElement("div", {
	    style: {
	      marginBottom: '32px'
	    }
	  }, react_1.default.createElement("h1", {
	    style: {
	      fontSize: '28px',
	      fontWeight: 700,
	      margin: 0,
	      color: '#e2e8f0'
	    }
	  }, greeting, " \uD83D\uDC4B"), react_1.default.createElement("p", {
	    style: {
	      color: '#94a3b8',
	      marginTop: '6px',
	      fontSize: '15px'
	    }
	  }, "Here's a live snapshot of your portfolio content.")), error && react_1.default.createElement("div", {
	    style: {
	      padding: '12px 16px',
	      background: 'rgba(239,68,68,0.15)',
	      border: '1px solid rgba(239,68,68,0.4)',
	      borderRadius: '8px',
	      color: '#fca5a5',
	      marginBottom: '24px',
	      fontSize: '14px'
	    }
	  }, "\u26A0\uFE0F ", error), react_1.default.createElement("div", {
	    style: {
	      display: 'grid',
	      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
	      gap: '20px'
	    }
	  }, CARDS.map(({
	    key,
	    label,
	    icon,
	    accent
	  }) => react_1.default.createElement("div", {
	    key: key,
	    style: {
	      background: 'rgba(30,41,59,0.8)',
	      border: `1px solid ${accent}40`,
	      borderRadius: '12px',
	      padding: '24px',
	      boxShadow: `0 0 0 1px ${accent}20, 0 4px 24px rgba(0,0,0,0.3)`,
	      transition: 'transform 150ms'
	    }
	  }, react_1.default.createElement("div", {
	    style: {
	      fontSize: '28px',
	      marginBottom: '12px',
	      lineHeight: 1
	    }
	  }, icon), react_1.default.createElement("div", {
	    style: {
	      fontSize: '36px',
	      fontWeight: 700,
	      color: loading ? '#4b5563' : accent,
	      lineHeight: 1,
	      marginBottom: '6px',
	      transition: 'color 300ms'
	    }
	  }, loading ? '—' : String(stats[key])), react_1.default.createElement("div", {
	    style: {
	      color: '#94a3b8',
	      fontSize: '13px',
	      fontWeight: 500,
	      letterSpacing: '0.025em'
	    }
	  }, label)))), react_1.default.createElement("div", {
	    style: {
	      marginTop: '40px'
	    }
	  }, react_1.default.createElement("h2", {
	    style: {
	      fontSize: '16px',
	      fontWeight: 600,
	      color: '#cbd5e1',
	      marginBottom: '16px'
	    }
	  }, "Quick actions"), react_1.default.createElement("div", {
	    style: {
	      display: 'flex',
	      gap: '12px',
	      flexWrap: 'wrap'
	    }
	  }, [{
	    label: '+ New Blog Post',
	    href: '/admin/resources/BlogPost/actions/new',
	    color: '#6366f1'
	  }, {
	    label: '+ New Project',
	    href: '/admin/resources/Project/actions/new',
	    color: '#22c55e'
	  }, {
	    label: '+ New Album',
	    href: '/admin/resources/Album/actions/new',
	    color: '#a855f7'
	  }, {
	    label: '+ Upload Photos',
	    href: '/admin/resources/Photo/actions/new',
	    color: '#3b82f6'
	  }].map(({
	    label,
	    href,
	    color
	  }) => react_1.default.createElement("a", {
	    key: href,
	    href: href,
	    style: {
	      display: 'inline-block',
	      padding: '9px 18px',
	      background: `${color}20`,
	      border: `1px solid ${color}60`,
	      borderRadius: '8px',
	      color,
	      fontSize: '13px',
	      fontWeight: 600,
	      textDecoration: 'none',
	      transition: 'background 150ms'
	    }
	  }, label)))), react_1.default.createElement("p", {
	    style: {
	      color: '#475569',
	      fontSize: '12px',
	      marginTop: '32px'
	    }
	  }, "Stats loaded at ", new Date().toLocaleTimeString()));
	};
	var _default = dashboard.default = Dashboard;

	AdminJS.UserComponents = {};
	AdminJS.UserComponents.MarkdownEditor = _default$6;
	AdminJS.UserComponents.TagPicker = _default$5;
	AdminJS.UserComponents.SkillPicker = _default$4;
	AdminJS.UserComponents.MediaUploader = _default$3;
	AdminJS.UserComponents.VideoManager = _default$2;
	AdminJS.UserComponents.PhotoUploader = _default$1;
	AdminJS.UserComponents.Dashboard = _default;

})(React, AdminJS);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9kaXN0L2FkbWluL2NvbXBvbmVudHMvbWFya2Rvd24tZWRpdG9yLmpzIiwiLi4vZGlzdC9hZG1pbi9jb21wb25lbnRzL3RhZy1waWNrZXIuanMiLCIuLi9kaXN0L2FkbWluL2NvbXBvbmVudHMvc2tpbGwtcGlja2VyLmpzIiwiLi4vZGlzdC9hZG1pbi9jb21wb25lbnRzL21lZGlhLXVwbG9hZGVyLmpzIiwiLi4vZGlzdC9hZG1pbi9jb21wb25lbnRzL3ZpZGVvLW1hbmFnZXIuanMiLCIuLi9kaXN0L2FkbWluL2NvbXBvbmVudHMvcGhvdG8tdXBsb2FkZXIuanMiLCIuLi9kaXN0L2FkbWluL2NvbXBvbmVudHMvZGFzaGJvYXJkLmpzIiwiZW50cnkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcbiAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19zZXRNb2R1bGVEZWZhdWx0KSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xufSkgOiBmdW5jdGlvbihvLCB2KSB7XG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xufSk7XG52YXIgX19pbXBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydFN0YXIpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG93bktleXMgPSBmdW5jdGlvbihvKSB7XG4gICAgICAgIG93bktleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgdmFyIGFyID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBrIGluIG8pIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobywgaykpIGFyW2FyLmxlbmd0aF0gPSBrO1xuICAgICAgICAgICAgcmV0dXJuIGFyO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gb3duS2V5cyhvKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAobW9kKSB7XG4gICAgICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrID0gb3duS2V5cyhtb2QpLCBpID0gMDsgaSA8IGsubGVuZ3RoOyBpKyspIGlmIChrW2ldICE9PSBcImRlZmF1bHRcIikgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrW2ldKTtcbiAgICAgICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xufSkoKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHJlYWN0XzEgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcInJlYWN0XCIpKTtcbmZ1bmN0aW9uIGVzYyhzKSB7XG4gICAgcmV0dXJuIHMucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpO1xufVxuZnVuY3Rpb24gcmVuZGVyTWFya2Rvd24ocmF3KSB7XG4gICAgY29uc3Qgc2F2ZWQgPSBbXTtcbiAgICBsZXQgcyA9IHJhdy5yZXBsYWNlKC9gYGAoXFx3KilcXG4/KFtcXHNcXFNdKj8pYGBgL2csIChfLCBsYW5nLCBjb2RlKSA9PiB7XG4gICAgICAgIHNhdmVkLnB1c2goYDxwcmUgc3R5bGU9XCJiYWNrZ3JvdW5kOiMwZDExMTc7cGFkZGluZzoxMnB4O2JvcmRlci1yYWRpdXM6NnB4O292ZXJmbG93OmF1dG9cIj48Y29kZT4ke2VzYyhjb2RlLnRyaW0oKSl9PC9jb2RlPjwvcHJlPmApO1xuICAgICAgICByZXR1cm4gYFxceDAwQ0Ike3NhdmVkLmxlbmd0aCAtIDF9XFx4MDBgO1xuICAgIH0pO1xuICAgIHMgPSBzLnJlcGxhY2UoL2AoW15gXFxuXSspYC9nLCAoXywgYykgPT4gYDxjb2RlIHN0eWxlPVwiYmFja2dyb3VuZDojMWUyOTNiO3BhZGRpbmc6MnB4IDZweDtib3JkZXItcmFkaXVzOjRweDtmb250LXNpemU6MC45ZW1cIj4ke2VzYyhjKX08L2NvZGU+YCk7XG4gICAgY29uc3QgbGluZXMgPSBzLnNwbGl0KCdcXG4nKTtcbiAgICBjb25zdCBvdXQgPSBbXTtcbiAgICBsZXQgbGlzdEJ1ZiA9IFtdO1xuICAgIGxldCBsaXN0VHlwZSA9ICd1bCc7XG4gICAgY29uc3QgZmx1c2hMaXN0ID0gKCkgPT4ge1xuICAgICAgICBpZiAoIWxpc3RCdWYubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBvdXQucHVzaChgPCR7bGlzdFR5cGV9IHN0eWxlPVwicGFkZGluZy1sZWZ0OjEuNWVtO21hcmdpbjowLjVlbSAwXCI+JHtsaXN0QnVmLmpvaW4oJycpfTwvJHtsaXN0VHlwZX0+YCk7XG4gICAgICAgIGxpc3RCdWYgPSBbXTtcbiAgICB9O1xuICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgICBjb25zdCBoID0gbGluZS5tYXRjaCgvXigjezEsNn0pXFxzKyguKykvKTtcbiAgICAgICAgaWYgKGgpIHtcbiAgICAgICAgICAgIGZsdXNoTGlzdCgpO1xuICAgICAgICAgICAgb3V0LnB1c2goYDxoJHtoWzFdLmxlbmd0aH0gc3R5bGU9XCJtYXJnaW46MC43NWVtIDAgMC4yNWVtXCI+JHtoWzJdfTwvaCR7aFsxXS5sZW5ndGh9PmApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYnEgPSBsaW5lLm1hdGNoKC9ePlxccyooLiopLyk7XG4gICAgICAgIGlmIChicSkge1xuICAgICAgICAgICAgZmx1c2hMaXN0KCk7XG4gICAgICAgICAgICBvdXQucHVzaChgPGJsb2NrcXVvdGUgc3R5bGU9XCJib3JkZXItbGVmdDozcHggc29saWQgIzYzNjZmMTttYXJnaW46MC41ZW0gMDtwYWRkaW5nOjRweCAxMnB4O2NvbG9yOiM5NGEzYjhcIj4ke2JxWzFdfTwvYmxvY2txdW90ZT5gKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvXlstKl9dezMsfSQvLnRlc3QobGluZS50cmltKCkpKSB7XG4gICAgICAgICAgICBmbHVzaExpc3QoKTtcbiAgICAgICAgICAgIG91dC5wdXNoKCc8aHIgc3R5bGU9XCJib3JkZXI6bm9uZTtib3JkZXItdG9wOjFweCBzb2xpZCAjMzM0MTU1O21hcmdpbjoxZW0gMFwiPicpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdWxtID0gbGluZS5tYXRjaCgvXihcXHMqKVstKitdXFxzKyguKikvKTtcbiAgICAgICAgY29uc3Qgb2xtID0gbGluZS5tYXRjaCgvXihcXHMqKVxcZCtcXC5cXHMrKC4qKS8pO1xuICAgICAgICBpZiAodWxtIHx8IG9sbSkge1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHVsbSA/ICd1bCcgOiAnb2wnO1xuICAgICAgICAgICAgaWYgKGxpc3RCdWYubGVuZ3RoICYmIHR5cGUgIT09IGxpc3RUeXBlKVxuICAgICAgICAgICAgICAgIGZsdXNoTGlzdCgpO1xuICAgICAgICAgICAgbGlzdFR5cGUgPSB0eXBlO1xuICAgICAgICAgICAgbGlzdEJ1Zi5wdXNoKGA8bGk+JHsodWxtID8/IG9sbSlbMl19PC9saT5gKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGZsdXNoTGlzdCgpO1xuICAgICAgICBvdXQucHVzaChsaW5lKTtcbiAgICB9XG4gICAgZmx1c2hMaXN0KCk7XG4gICAgcyA9IG91dC5qb2luKCdcXG4nKTtcbiAgICBzID0gcy5yZXBsYWNlKC9cXCpcXCpcXCooLis/KVxcKlxcKlxcKi9nLCAnPHN0cm9uZz48ZW0+JDE8L2VtPjwvc3Ryb25nPicpO1xuICAgIHMgPSBzLnJlcGxhY2UoL1xcKlxcKiguKz8pXFwqXFwqL2csICc8c3Ryb25nPiQxPC9zdHJvbmc+Jyk7XG4gICAgcyA9IHMucmVwbGFjZSgvXFwqKC4rPylcXCovZywgJzxlbT4kMTwvZW0+Jyk7XG4gICAgcyA9IHMucmVwbGFjZSgvfn4oLis/KX5+L2csICc8ZGVsPiQxPC9kZWw+Jyk7XG4gICAgcyA9IHMucmVwbGFjZSgvIVxcWyhbXlxcXV0qKVxcXVxcKChbXildKylcXCkvZywgJzxpbWcgc3JjPVwiJDJcIiBhbHQ9XCIkMVwiIHN0eWxlPVwibWF4LXdpZHRoOjEwMCU7Ym9yZGVyLXJhZGl1czo2cHg7bWFyZ2luOjAuNWVtIDBcIj4nKTtcbiAgICBzID0gcy5yZXBsYWNlKC9cXFsoW15cXF1dKylcXF1cXCgoW14pXSspXFwpL2csICc8YSBocmVmPVwiJDJcIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lclwiIHN0eWxlPVwiY29sb3I6IzYzNjZmMVwiPiQxPC9hPicpO1xuICAgIGNvbnN0IHNlY3Rpb25zID0gcy5zcGxpdCgvXFxuXFxuKy8pO1xuICAgIHMgPSBzZWN0aW9ucy5tYXAoc2VjID0+IHtcbiAgICAgICAgY29uc3QgdCA9IHNlYy50cmltKCk7XG4gICAgICAgIGlmICghdClcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgaWYgKC9ePChoWzEtNl18dWx8b2x8cHJlfGJsb2NrcXVvdGV8aHJ8aW1nKS8udGVzdCh0KSB8fCB0LnN0YXJ0c1dpdGgoJ1xceDAwQ0InKSlcbiAgICAgICAgICAgIHJldHVybiB0O1xuICAgICAgICByZXR1cm4gYDxwIHN0eWxlPVwibWFyZ2luOjAuNWVtIDA7bGluZS1oZWlnaHQ6MS43XCI+JHt0LnJlcGxhY2UoL1xcbi9nLCAnPGJyPicpfTwvcD5gO1xuICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgIHNhdmVkLmZvckVhY2goKGJsaywgaSkgPT4geyBzID0gcy5yZXBsYWNlKGBcXHgwMENCJHtpfVxceDAwYCwgYmxrKTsgfSk7XG4gICAgcmV0dXJuIHM7XG59XG5jb25zdCBNYXJrZG93bkVkaXRvciA9ICh7IHByb3BlcnR5LCByZWNvcmQsIG9uQ2hhbmdlIH0pID0+IHtcbiAgICBjb25zdCBmaWVsZFBhdGggPSBwcm9wZXJ0eS5wYXRoO1xuICAgIGNvbnN0IGluaXRpYWxWYWx1ZSA9IHJlY29yZD8ucGFyYW1zPy5bZmllbGRQYXRoXSA/PyAnJztcbiAgICBjb25zdCBbdmFsdWUsIHNldFZhbHVlXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShpbml0aWFsVmFsdWUpO1xuICAgIGNvbnN0IFtwcmV2aWV3LCBzZXRQcmV2aWV3XSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKSgoKSA9PiByZW5kZXJNYXJrZG93bihpbml0aWFsVmFsdWUpKTtcbiAgICBjb25zdCBbdXBsb2FkaW5nLCBzZXRVcGxvYWRpbmddID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKGZhbHNlKTtcbiAgICBjb25zdCBbYWN0aXZlVGFiLCBzZXRBY3RpdmVUYWJdID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKCdzcGxpdCcpO1xuICAgIGNvbnN0IHRleHRhcmVhUmVmID0gKDAsIHJlYWN0XzEudXNlUmVmKShudWxsKTtcbiAgICBjb25zdCBmaWxlSW5wdXRSZWYgPSAoMCwgcmVhY3RfMS51c2VSZWYpKG51bGwpO1xuICAgIGNvbnN0IGRlYm91bmNlUmVmID0gKDAsIHJlYWN0XzEudXNlUmVmKShudWxsKTtcbiAgICAoMCwgcmVhY3RfMS51c2VFZmZlY3QpKCgpID0+IHtcbiAgICAgICAgY29uc3QgdiA9IHJlY29yZD8ucGFyYW1zPy5bZmllbGRQYXRoXSA/PyAnJztcbiAgICAgICAgc2V0VmFsdWUodik7XG4gICAgICAgIHNldFByZXZpZXcocmVuZGVyTWFya2Rvd24odikpO1xuICAgIH0sIFtyZWNvcmQ/LmlkXSk7XG4gICAgY29uc3QgaGFuZGxlQ2hhbmdlID0gKDAsIHJlYWN0XzEudXNlQ2FsbGJhY2spKChlKSA9PiB7XG4gICAgICAgIGNvbnN0IHYgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgc2V0VmFsdWUodik7XG4gICAgICAgIG9uQ2hhbmdlKGZpZWxkUGF0aCwgdik7XG4gICAgICAgIGlmIChkZWJvdW5jZVJlZi5jdXJyZW50KVxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGRlYm91bmNlUmVmLmN1cnJlbnQpO1xuICAgICAgICBkZWJvdW5jZVJlZi5jdXJyZW50ID0gc2V0VGltZW91dCgoKSA9PiBzZXRQcmV2aWV3KHJlbmRlck1hcmtkb3duKHYpKSwgMzAwKTtcbiAgICB9LCBbZmllbGRQYXRoLCBvbkNoYW5nZV0pO1xuICAgIGNvbnN0IGluc2VydEF0Q3Vyc29yID0gKDAsIHJlYWN0XzEudXNlQ2FsbGJhY2spKCh0ZXh0KSA9PiB7XG4gICAgICAgIGNvbnN0IHRhID0gdGV4dGFyZWFSZWYuY3VycmVudDtcbiAgICAgICAgaWYgKCF0YSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB0YS5zZWxlY3Rpb25TdGFydCA/PyB2YWx1ZS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGVuZCA9IHRhLnNlbGVjdGlvbkVuZCA/PyB2YWx1ZS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IG5leHQgPSB2YWx1ZS5zbGljZSgwLCBzdGFydCkgKyB0ZXh0ICsgdmFsdWUuc2xpY2UoZW5kKTtcbiAgICAgICAgc2V0VmFsdWUobmV4dCk7XG4gICAgICAgIG9uQ2hhbmdlKGZpZWxkUGF0aCwgbmV4dCk7XG4gICAgICAgIHNldFByZXZpZXcocmVuZGVyTWFya2Rvd24obmV4dCkpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRhLnNlbGVjdGlvblN0YXJ0ID0gdGEuc2VsZWN0aW9uRW5kID0gc3RhcnQgKyB0ZXh0Lmxlbmd0aDtcbiAgICAgICAgICAgIHRhLmZvY3VzKCk7XG4gICAgICAgIH0sIDApO1xuICAgIH0sIFt2YWx1ZSwgZmllbGRQYXRoLCBvbkNoYW5nZV0pO1xuICAgIGNvbnN0IGhhbmRsZVVwbG9hZCA9IGFzeW5jIChlKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSBlLnRhcmdldC5maWxlcz8uWzBdO1xuICAgICAgICBpZiAoIWZpbGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHNldFVwbG9hZGluZyh0cnVlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGZkID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgICAgICBmZC5hcHBlbmQoJ2ZpbGUnLCBmaWxlKTtcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKCcvdjEvdXBsb2FkJywgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogZmQsIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScgfSk7XG4gICAgICAgICAgICBpZiAoIXJlcy5vaylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgJHtyZXMuc3RhdHVzfWApO1xuICAgICAgICAgICAgY29uc3QgeyB1cmwgfSA9IGF3YWl0IHJlcy5qc29uKCk7XG4gICAgICAgICAgICBpbnNlcnRBdEN1cnNvcihgIVske2ZpbGUubmFtZS5yZXBsYWNlKC9cXC5bXi5dKyQvLCAnJyl9XSgke3VybH0pYCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgYWxlcnQoYEltYWdlIHVwbG9hZCBmYWlsZWQ6ICR7ZXJyPy5tZXNzYWdlID8/ICd1bmtub3duIGVycm9yJ31gKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldFVwbG9hZGluZyhmYWxzZSk7XG4gICAgICAgICAgICBpZiAoZmlsZUlucHV0UmVmLmN1cnJlbnQpXG4gICAgICAgICAgICAgICAgZmlsZUlucHV0UmVmLmN1cnJlbnQudmFsdWUgPSAnJztcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgZWRpdG9yU3R5bGUgPSB7XG4gICAgICAgIGZsZXg6IDEsIGZvbnRGYW1pbHk6ICdcIkZpcmEgQ29kZVwiLFwiQ2FzY2FkaWEgQ29kZVwiLFwiSmV0QnJhaW5zIE1vbm9cIixtb25vc3BhY2UnLFxuICAgICAgICBmb250U2l6ZTogJzEzcHgnLCBsaW5lSGVpZ2h0OiAnMS42NScsIHBhZGRpbmc6ICcxMnB4JyxcbiAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICMzMzQxNTUnLCBib3JkZXJSYWRpdXM6ICc2cHgnLCByZXNpemU6ICdub25lJyxcbiAgICAgICAgYmFja2dyb3VuZDogJyMwZjE3MmEnLCBjb2xvcjogJyNlMmU4ZjAnLCBtaW5IZWlnaHQ6ICc0NjBweCcsXG4gICAgICAgIGJveFNpemluZzogJ2JvcmRlci1ib3gnLCBvdmVyZmxvd1k6ICdhdXRvJyxcbiAgICB9O1xuICAgIGNvbnN0IHByZXZpZXdTdHlsZSA9IHtcbiAgICAgICAgZmxleDogMSwgcGFkZGluZzogJzEycHggMTZweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjMzM0MTU1JywgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICAgICAgYmFja2dyb3VuZDogJyMwZjE3MmEnLCBjb2xvcjogJyNlMmU4ZjAnLCBtaW5IZWlnaHQ6ICc0NjBweCcsXG4gICAgICAgIG92ZXJmbG93WTogJ2F1dG8nLCBmb250U2l6ZTogJzE0cHgnLCBsaW5lSGVpZ2h0OiAnMS43JyxcbiAgICAgICAgYm94U2l6aW5nOiAnYm9yZGVyLWJveCcsXG4gICAgfTtcbiAgICBjb25zdCB0YWJCdG4gPSAoYWN0aXZlKSA9PiAoe1xuICAgICAgICBwYWRkaW5nOiAnNXB4IDE0cHgnLCBmb250U2l6ZTogJzEycHgnLCBmb250V2VpZ2h0OiA2MDAsIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICBib3JkZXI6ICcxcHggc29saWQgIzMzNDE1NScsIGJvcmRlclJhZGl1czogJzVweCcsIGJhY2tncm91bmQ6IGFjdGl2ZSA/ICcjNjM2NmYxJyA6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgIGNvbG9yOiBhY3RpdmUgPyAnI2ZmZicgOiAnIzk0YTNiOCcsXG4gICAgfSk7XG4gICAgY29uc3Qgc2hvd0VkaXRvciA9IGFjdGl2ZVRhYiAhPT0gJ3ByZXZpZXcnO1xuICAgIGNvbnN0IHNob3dQcmV2aWV3ID0gYWN0aXZlVGFiICE9PSAnZWRpdG9yJztcbiAgICByZXR1cm4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAnOHB4JyB9IH0sXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICc2cHgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZmxleFdyYXA6ICd3cmFwJyB9IH0sXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnNHB4JyB9IH0sIFsnc3BsaXQnLCAnZWRpdG9yJywgJ3ByZXZpZXcnXS5tYXAodCA9PiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwgeyBrZXk6IHQsIHR5cGU6IFwiYnV0dG9uXCIsIHN0eWxlOiB0YWJCdG4oYWN0aXZlVGFiID09PSB0KSwgb25DbGljazogKCkgPT4gc2V0QWN0aXZlVGFiKHQpIH0sIHQgPT09ICdzcGxpdCcgPyAn4oqfIFNwbGl0JyA6IHQgPT09ICdlZGl0b3InID8gJ+KcjyBFZGl0b3InIDogJ/CfkYEgUHJldmlldycpKSkpLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0InLCB0aXRsZTogJ0JvbGQnLCBpbnNlcnQ6ICcqKmJvbGQqKicgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnSScsIHRpdGxlOiAnSXRhbGljJywgaW5zZXJ0OiAnKml0YWxpYyonIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0gnLCB0aXRsZTogJ0hlYWRpbmcnLCBpbnNlcnQ6ICcjIyBIZWFkaW5nXFxuJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdgJywgdGl0bGU6ICdJbmxpbmUgY29kZScsIGluc2VydDogJ2Bjb2RlYCcgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAn4omhJywgdGl0bGU6ICdDb2RlIGJsb2NrJywgaW5zZXJ0OiAnYGBgXFxuY29kZVxcbmBgYFxcbicgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAn4oaSJywgdGl0bGU6ICdMaW5rJywgaW5zZXJ0OiAnW3RleHRdKHVybCknIH0sXG4gICAgICAgICAgICBdLm1hcCgoeyBsYWJlbCwgdGl0bGUsIGluc2VydCB9KSA9PiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwgeyBrZXk6IGxhYmVsLCB0eXBlOiBcImJ1dHRvblwiLCB0aXRsZTogdGl0bGUsIG9uQ2xpY2s6ICgpID0+IGluc2VydEF0Q3Vyc29yKGluc2VydCksIHN0eWxlOiB7IHBhZGRpbmc6ICc0cHggMTBweCcsIGZvbnRTaXplOiAnMTJweCcsIGZvbnRXZWlnaHQ6IDcwMCwgYm9yZGVyOiAnMXB4IHNvbGlkICMzMzQxNTUnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiAndHJhbnNwYXJlbnQnLCBjb2xvcjogJyM5NGEzYjgnLCBjdXJzb3I6ICdwb2ludGVyJyB9IH0sIGxhYmVsKSkpLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBkaXNhYmxlZDogdXBsb2FkaW5nLCBvbkNsaWNrOiAoKSA9PiBmaWxlSW5wdXRSZWYuY3VycmVudD8uY2xpY2soKSwgc3R5bGU6IHsgcGFkZGluZzogJzVweCAxMnB4JywgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNjAwLCBib3JkZXI6ICcxcHggc29saWQgIzYzNjZmMScsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6IHVwbG9hZGluZyA/ICcjMWUyOTNiJyA6ICcjNjM2NmYxMjAnLCBjb2xvcjogJyM4MThjZjgnLCBjdXJzb3I6IHVwbG9hZGluZyA/ICdub3QtYWxsb3dlZCcgOiAncG9pbnRlcicgfSB9LCB1cGxvYWRpbmcgPyAn4o+zIFVwbG9hZGluZ+KApicgOiAn8J+TtyBJbWFnZScpLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7IHJlZjogZmlsZUlucHV0UmVmLCB0eXBlOiBcImZpbGVcIiwgYWNjZXB0OiBcImltYWdlLypcIiwgc3R5bGU6IHsgZGlzcGxheTogJ25vbmUnIH0sIG9uQ2hhbmdlOiBoYW5kbGVVcGxvYWQgfSkpLFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnOHB4JyB9IH0sXG4gICAgICAgICAgICBzaG93RWRpdG9yICYmIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInRleHRhcmVhXCIsIHsgcmVmOiB0ZXh0YXJlYVJlZiwgdmFsdWU6IHZhbHVlLCBvbkNoYW5nZTogaGFuZGxlQ2hhbmdlLCBzcGVsbENoZWNrOiBmYWxzZSwgc3R5bGU6IGVkaXRvclN0eWxlLCBwbGFjZWhvbGRlcjogXCJXcml0ZSBNYXJrZG93biBoZXJlXFx1MjAyNlwiIH0pKSxcbiAgICAgICAgICAgIHNob3dQcmV2aWV3ICYmIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiBwcmV2aWV3U3R5bGUsIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MOiB7IF9faHRtbDogcHJldmlldyB8fCAnPHNwYW4gc3R5bGU9XCJjb2xvcjojNDc1NTY5XCI+UHJldmlldyB3aWxsIGFwcGVhciBoZXJl4oCmPC9zcGFuPicgfSB9KSkpLFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInBcIiwgeyBzdHlsZTogeyBmb250U2l6ZTogJzExcHgnLCBjb2xvcjogJyM0NzU1NjknLCBtYXJnaW46IDAgfSB9LCBcIkdGTSBzdXBwb3J0ZWQgXFx1MDBCNyBwcmV2aWV3IGRlYm91bmNlZCAzMDAgbXMgXFx1MDBCNyBDdHJsK1ogdG8gdW5kb1wiKSkpO1xufTtcbmV4cG9ydHMuZGVmYXVsdCA9IE1hcmtkb3duRWRpdG9yO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFya2Rvd24tZWRpdG9yLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBvd25LZXlzID0gZnVuY3Rpb24obykge1xuICAgICAgICBvd25LZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgIHZhciBhciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBvKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspKSBhclthci5sZW5ndGhdID0gaztcbiAgICAgICAgICAgIHJldHVybiBhcjtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG93bktleXMobyk7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1vZCkge1xuICAgICAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayA9IG93bktleXMobW9kKSwgaSA9IDA7IGkgPCBrLmxlbmd0aDsgaSsrKSBpZiAoa1tpXSAhPT0gXCJkZWZhdWx0XCIpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwga1tpXSk7XG4gICAgICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCByZWFjdF8xID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5jb25zdCBhZG1pbmpzXzEgPSByZXF1aXJlKFwiYWRtaW5qc1wiKTtcbmNvbnN0IGFwaSA9IG5ldyBhZG1pbmpzXzEuQXBpQ2xpZW50KCk7XG5jb25zdCBUYWdQaWNrZXIgPSAoeyBwcm9wZXJ0eSwgcmVjb3JkLCBvbkNoYW5nZSB9KSA9PiB7XG4gICAgY29uc3QgW2FsbFRhZ3MsIHNldEFsbFRhZ3NdID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKFtdKTtcbiAgICBjb25zdCBbc2VsZWN0ZWQsIHNldFNlbGVjdGVkXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShbXSk7XG4gICAgY29uc3QgW3F1ZXJ5LCBzZXRRdWVyeV0gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoJycpO1xuICAgIGNvbnN0IFtzaG93RHJvcGRvd24sIHNldFNob3dEcm9wZG93bl0gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoZmFsc2UpO1xuICAgIGNvbnN0IGlucHV0UmVmID0gKDAsIHJlYWN0XzEudXNlUmVmKShudWxsKTtcbiAgICAoMCwgcmVhY3RfMS51c2VFZmZlY3QpKCgpID0+IHtcbiAgICAgICAgZmV0Y2goJy92MS9ibG9nL3RhZ3MnLCB7IGNyZWRlbnRpYWxzOiAnaW5jbHVkZScgfSlcbiAgICAgICAgICAgIC50aGVuKHIgPT4gci5qc29uKCkpXG4gICAgICAgICAgICAudGhlbigodGFncykgPT4gc2V0QWxsVGFncyh0YWdzKSlcbiAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7IH0pO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSByZWNvcmQ/LnBhcmFtcyA/PyB7fTtcbiAgICAgICAgY29uc3QgZnJvbVBhcmFtcyA9IFtdO1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIHdoaWxlIChwYXJhbXNbYCR7cHJvcGVydHkucGF0aH0uJHtpfS5pZGBdKSB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IHBhcmFtc1tgJHtwcm9wZXJ0eS5wYXRofS4ke2l9LmlkYF07XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gcGFyYW1zW2Ake3Byb3BlcnR5LnBhdGh9LiR7aX0ubmFtZWBdO1xuICAgICAgICAgICAgaWYgKGlkICYmIG5hbWUpXG4gICAgICAgICAgICAgICAgZnJvbVBhcmFtcy5wdXNoKHsgaWQsIG5hbWUgfSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9wdWxhdGVkID0gcmVjb3JkPy5wb3B1bGF0ZWQ/Lltwcm9wZXJ0eS5wYXRoXSA/PyBbXTtcbiAgICAgICAgY29uc3QgZnJvbVBvcHVsYXRlZCA9IHBvcHVsYXRlZFxuICAgICAgICAgICAgLm1hcCgocikgPT4gKHsgaWQ6IHIucGFyYW1zPy5pZCwgbmFtZTogci5wYXJhbXM/Lm5hbWUgfSkpXG4gICAgICAgICAgICAuZmlsdGVyKCh0KSA9PiB0LmlkICYmIHQubmFtZSk7XG4gICAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0KCk7XG4gICAgICAgIGNvbnN0IG1lcmdlZCA9IFsuLi5mcm9tUGFyYW1zLCAuLi5mcm9tUG9wdWxhdGVkXS5maWx0ZXIoKHQpID0+ICFzZWVuLmhhcyh0LmlkKSAmJiBzZWVuLmFkZCh0LmlkKSk7XG4gICAgICAgIHNldFNlbGVjdGVkKG1lcmdlZCk7XG4gICAgfSwgW3JlY29yZD8uaWRdKTtcbiAgICBjb25zdCBlbWl0ID0gKHRhZ3MpID0+IHtcbiAgICAgICAgb25DaGFuZ2UocHJvcGVydHkucGF0aCwgdGFncy5sZW5ndGggPiAwID8gdGFncy5tYXAodCA9PiB0LmlkKSA6IFsnX19lbXB0eV9fJ10pO1xuICAgIH07XG4gICAgY29uc3QgYWRkVGFnID0gKHRhZykgPT4ge1xuICAgICAgICBpZiAoc2VsZWN0ZWQuc29tZShzID0+IHMuaWQgPT09IHRhZy5pZCkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IG5leHQgPSBbLi4uc2VsZWN0ZWQsIHRhZ107XG4gICAgICAgIHNldFNlbGVjdGVkKG5leHQpO1xuICAgICAgICBlbWl0KG5leHQpO1xuICAgICAgICBzZXRRdWVyeSgnJyk7XG4gICAgICAgIHNldFNob3dEcm9wZG93bihmYWxzZSk7XG4gICAgfTtcbiAgICBjb25zdCByZW1vdmVUYWcgPSAoaWQpID0+IHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHNlbGVjdGVkLmZpbHRlcih0ID0+IHQuaWQgIT09IGlkKTtcbiAgICAgICAgc2V0U2VsZWN0ZWQobmV4dCk7XG4gICAgICAgIGVtaXQobmV4dCk7XG4gICAgfTtcbiAgICBjb25zdCBjcmVhdGVUYWcgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBxdWVyeS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBleGlzdGluZyA9IGFsbFRhZ3MuZmluZCh0ID0+IHQubmFtZSA9PT0gbmFtZSk7XG4gICAgICAgIGlmIChleGlzdGluZykge1xuICAgICAgICAgICAgYWRkVGFnKGV4aXN0aW5nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgYXBpLnJlc291cmNlQWN0aW9uKHtcbiAgICAgICAgICAgICAgICByZXNvdXJjZUlkOiAnVGFnJyxcbiAgICAgICAgICAgICAgICBhY3Rpb25OYW1lOiAnbmV3JyxcbiAgICAgICAgICAgICAgICBkYXRhOiB7IG5hbWUgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgY3JlYXRlZCA9IHtcbiAgICAgICAgICAgICAgICBpZDogcmVzLmRhdGE/LnJlY29yZD8ucGFyYW1zPy5pZCxcbiAgICAgICAgICAgICAgICBuYW1lOiByZXMuZGF0YT8ucmVjb3JkPy5wYXJhbXM/Lm5hbWUgPz8gbmFtZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZXRBbGxUYWdzKHByZXYgPT4gWy4uLnByZXYsIGNyZWF0ZWRdLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpKTtcbiAgICAgICAgICAgIGFkZFRhZyhjcmVhdGVkKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICBhbGVydChgQ291bGQgbm90IGNyZWF0ZSB0YWcgXCIke25hbWV9XCIuIFBsZWFzZSB0cnkgYWdhaW4uYCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGZpbHRlcmVkID0gYWxsVGFncy5maWx0ZXIodCA9PiB0Lm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeS50b0xvd2VyQ2FzZSgpKSAmJlxuICAgICAgICAhc2VsZWN0ZWQuc29tZShzID0+IHMuaWQgPT09IHQuaWQpKTtcbiAgICBjb25zdCBjaGlwID0ge1xuICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnNHB4JyxcbiAgICAgICAgcGFkZGluZzogJzNweCAxMHB4JywgYmFja2dyb3VuZENvbG9yOiAnIzNkNWFmMScsIGNvbG9yOiAnI2ZmZicsXG4gICAgICAgIGJvcmRlclJhZGl1czogJzIwcHgnLCBmb250U2l6ZTogJzEycHgnLCBmb250V2VpZ2h0OiA1MDAsXG4gICAgfTtcbiAgICBjb25zdCByZW1vdmVCdG4gPSB7XG4gICAgICAgIGJhY2tncm91bmQ6ICdub25lJywgYm9yZGVyOiAnbm9uZScsIGNvbG9yOiAnI2ZmZicsXG4gICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLCBsaW5lSGVpZ2h0OiAxLCBwYWRkaW5nOiAnMCAwIDAgMnB4JywgZm9udFNpemU6ICcxNHB4JyxcbiAgICB9O1xuICAgIHJldHVybiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9IH0sXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4V3JhcDogJ3dyYXAnLCBnYXA6ICc2cHgnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBtaW5IZWlnaHQ6ICcyOHB4JyB9IH0sIHNlbGVjdGVkLm1hcCh0YWcgPT4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7IGtleTogdGFnLmlkLCBzdHlsZTogY2hpcCB9LFxuICAgICAgICAgICAgdGFnLm5hbWUsXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIHN0eWxlOiByZW1vdmVCdG4sIG9uQ2xpY2s6ICgpID0+IHJlbW92ZVRhZyh0YWcuaWQpIH0sIFwiXFx1MDBEN1wiKSkpKSksXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICc2cHgnIH0gfSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyByZWY6IGlucHV0UmVmLCB0eXBlOiBcInRleHRcIiwgdmFsdWU6IHF1ZXJ5LCBvbkNoYW5nZTogZSA9PiB7IHNldFF1ZXJ5KGUudGFyZ2V0LnZhbHVlKTsgc2V0U2hvd0Ryb3Bkb3duKHRydWUpOyB9LCBvbkZvY3VzOiAoKSA9PiBzZXRTaG93RHJvcGRvd24odHJ1ZSksIG9uQmx1cjogKCkgPT4gc2V0VGltZW91dCgoKSA9PiBzZXRTaG93RHJvcGRvd24oZmFsc2UpLCAyMDApLCBvbktleURvd246IGUgPT4geyBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVUYWcoKTtcbiAgICAgICAgICAgICAgICB9IH0sIHBsYWNlaG9sZGVyOiBcIlNlYXJjaCBvciBjcmVhdGUgYSB0YWdcXHUyMDI2XCIsIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgIGZsZXg6IDEsIHBhZGRpbmc6ICc3cHggMTFweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjNGE0YTZhJyxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNXB4JywgZm9udFNpemU6ICcxM3B4JywgYmFja2dyb3VuZENvbG9yOiAnIzFhMWEyZScsIGNvbG9yOiAnI2UwZTBlMCcsXG4gICAgICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgICAgIHF1ZXJ5LnRyaW0oKSAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBvbkNsaWNrOiBjcmVhdGVUYWcsIHN0eWxlOiB7IHBhZGRpbmc6ICc3cHggMTRweCcsIGJhY2tncm91bmRDb2xvcjogJyMyMmM1NWUnLCBjb2xvcjogJyNmZmYnLCBib3JkZXI6ICdub25lJywgYm9yZGVyUmFkaXVzOiAnNXB4JywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTNweCcsIGZvbnRXZWlnaHQ6IDUwMCB9IH0sIFwiKyBBZGRcIikpKSxcbiAgICAgICAgc2hvd0Ryb3Bkb3duICYmIGZpbHRlcmVkLmxlbmd0aCA+IDAgJiYgKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwidWxcIiwgeyBzdHlsZToge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICcxMDAlJywgbGVmdDogMCwgcmlnaHQ6IDAsIHpJbmRleDogOTk5OSxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmJywgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc1cHgnLFxuICAgICAgICAgICAgICAgIGxpc3RTdHlsZTogJ25vbmUnLCBtYXJnaW46ICcycHggMCcsIHBhZGRpbmc6IDAsIG1heEhlaWdodDogJzIwMHB4Jywgb3ZlcmZsb3dZOiAnYXV0bycsXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCA0cHggMTJweCByZ2JhKDAsMCwwLDAuMTUpJyxcbiAgICAgICAgICAgIH0gfSwgZmlsdGVyZWQubWFwKHRhZyA9PiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJsaVwiLCB7IGtleTogdGFnLmlkLCBvbk1vdXNlRG93bjogKCkgPT4gYWRkVGFnKHRhZyksIHN0eWxlOiB7IHBhZGRpbmc6ICc4cHggMTJweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEzcHgnLCBjb2xvcjogJyMzMzMnIH0gfSwgdGFnLm5hbWUpKSkpKSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJwXCIsIHsgc3R5bGU6IHsgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjODg4JywgbWFyZ2luOiAnNnB4IDAgMCcgfSB9LCBcIlR5cGUgdG8gc2VhcmNoIGV4aXN0aW5nIHRhZ3MgXFx1MDBCNyBwcmVzcyBFbnRlciBvciBjbGljayBcXFwiKyBBZGRcXFwiIHRvIGNyZWF0ZSBuZXdcIikpKTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBUYWdQaWNrZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10YWctcGlja2VyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBvd25LZXlzID0gZnVuY3Rpb24obykge1xuICAgICAgICBvd25LZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgIHZhciBhciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBvKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspKSBhclthci5sZW5ndGhdID0gaztcbiAgICAgICAgICAgIHJldHVybiBhcjtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG93bktleXMobyk7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1vZCkge1xuICAgICAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayA9IG93bktleXMobW9kKSwgaSA9IDA7IGkgPCBrLmxlbmd0aDsgaSsrKSBpZiAoa1tpXSAhPT0gXCJkZWZhdWx0XCIpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwga1tpXSk7XG4gICAgICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBTa2lsbFBpY2tlcjtcbmNvbnN0IHJlYWN0XzEgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcInJlYWN0XCIpKTtcbmZ1bmN0aW9uIFNraWxsUGlja2VyKHsgcHJvcGVydHksIHJlY29yZCwgb25DaGFuZ2UgfSkge1xuICAgIGNvbnN0IFtza2lsbHMsIHNldFNraWxsc10gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoW10pO1xuICAgIGNvbnN0IFtxdWVyeSwgc2V0UXVlcnldID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKCcnKTtcbiAgICBjb25zdCBbc2VsZWN0ZWQsIHNldFNlbGVjdGVkXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShbXSk7XG4gICAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKGZhbHNlKTtcbiAgICAoMCwgcmVhY3RfMS51c2VFZmZlY3QpKCgpID0+IHtcbiAgICAgICAgY29uc3QgaWRzID0gW107XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHJlY29yZC5wYXJhbXMgPz8ge30pLmZvckVhY2goKFtrZXksIHZhbF0pID0+IHtcbiAgICAgICAgICAgIGlmIChrZXkuc3RhcnRzV2l0aChgJHtwcm9wZXJ0eS5wYXRofS5gKSAmJiBrZXkuZW5kc1dpdGgoJy5pZCcpKSB7XG4gICAgICAgICAgICAgICAgaWRzLnB1c2godmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHBvcHVsYXRlZCA9IChyZWNvcmQucG9wdWxhdGVkID8/IHt9KVtwcm9wZXJ0eS5wYXRoXTtcbiAgICAgICAgaWYgKHBvcHVsYXRlZCkge1xuICAgICAgICAgICAgaWRzLnB1c2goLi4ucG9wdWxhdGVkLm1hcCgocykgPT4gcy5wYXJhbXM/LmlkID8/IHMuaWQpLmZpbHRlcihCb29sZWFuKSk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0U2VsZWN0ZWQoWy4uLm5ldyBTZXQoaWRzKV0pO1xuICAgIH0sIFtdKTtcbiAgICAoMCwgcmVhY3RfMS51c2VFZmZlY3QpKCgpID0+IHtcbiAgICAgICAgc2V0TG9hZGluZyh0cnVlKTtcbiAgICAgICAgY29uc3QgYmFzZSA9IHdpbmRvdy5fX0FQSV9CQVNFX19cbiAgICAgICAgICAgID8/IGAke3dpbmRvdy5sb2NhdGlvbi5wcm90b2NvbH0vLyR7d2luZG93LmxvY2F0aW9uLmhvc3RuYW1lfTozMDAxYDtcbiAgICAgICAgZmV0Y2goYCR7YmFzZX0vdjEvcmVzdW1lYClcbiAgICAgICAgICAgIC50aGVuKChyKSA9PiByLmpzb24oKSlcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiBzZXRTa2lsbHMoZGF0YT8uc2tpbGxzID8/IFtdKSlcbiAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7IH0pXG4gICAgICAgICAgICAuZmluYWxseSgoKSA9PiBzZXRMb2FkaW5nKGZhbHNlKSk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IHRvZ2dsZSA9ICgwLCByZWFjdF8xLnVzZUNhbGxiYWNrKSgoaWQpID0+IHtcbiAgICAgICAgc2V0U2VsZWN0ZWQoKHByZXYpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5leHQgPSBwcmV2LmluY2x1ZGVzKGlkKSA/IHByZXYuZmlsdGVyKCh4KSA9PiB4ICE9PSBpZCkgOiBbLi4ucHJldiwgaWRdO1xuICAgICAgICAgICAgb25DaGFuZ2UocHJvcGVydHkucGF0aCwgbmV4dC5sZW5ndGggPiAwID8gbmV4dCA6IFsnX19lbXB0eV9fJ10pO1xuICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH0pO1xuICAgIH0sIFtvbkNoYW5nZSwgcHJvcGVydHkucGF0aF0pO1xuICAgIGNvbnN0IGZpbHRlcmVkID0gcXVlcnlcbiAgICAgICAgPyBza2lsbHMuZmlsdGVyKChzKSA9PiBzLm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeS50b0xvd2VyQ2FzZSgpKSlcbiAgICAgICAgOiBza2lsbHM7XG4gICAgY29uc3QgY2F0ZWdvcmllcyA9IFsuLi5uZXcgU2V0KGZpbHRlcmVkLm1hcCgocykgPT4gcy5jYXRlZ29yeSkpXS5zb3J0KCk7XG4gICAgcmV0dXJuIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogOCB9IH0sXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IDYwMCwgdGV4dFRyYW5zZm9ybTogJ3VwcGVyY2FzZScsIGxldHRlclNwYWNpbmc6IDEsIG9wYWNpdHk6IDAuNyB9IH0sIHByb3BlcnR5LmxhYmVsKSxcbiAgICAgICAgc2VsZWN0ZWQubGVuZ3RoID4gMCAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhXcmFwOiAnd3JhcCcsIGdhcDogNCB9IH0sIHNlbGVjdGVkLm1hcCgoaWQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNrID0gc2tpbGxzLmZpbmQoKHMpID0+IHMuaWQgPT09IGlkKTtcbiAgICAgICAgICAgIHJldHVybiBzayA/IChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgeyBrZXk6IGlkLCBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMnB4IDhweCcsIGJvcmRlclJhZGl1czogNCwgZm9udFNpemU6IDExLCBmb250V2VpZ2h0OiA1MDAsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdyZ2JhKDk5LDEwMiwyNDEsMC4xNSknLCBib3JkZXI6ICcxcHggc29saWQgcmdiYSg5OSwxMDIsMjQxLDAuMzUpJyxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiA0LCBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgICAgICAgICB9LCBvbkNsaWNrOiAoKSA9PiB0b2dnbGUoaWQpIH0sXG4gICAgICAgICAgICAgICAgc2submFtZSxcbiAgICAgICAgICAgICAgICBcIiBcXHUyNzE1XCIpKSA6IG51bGw7XG4gICAgICAgIH0pKSksXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiwgcGxhY2Vob2xkZXI6IFwiRmlsdGVyIHNraWxscy4uLlwiLCB2YWx1ZTogcXVlcnksIG9uQ2hhbmdlOiAoZSkgPT4gc2V0UXVlcnkoZS50YXJnZXQudmFsdWUpLCBzdHlsZToge1xuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsIHBhZGRpbmc6ICc2cHggMTBweCcsIGJvcmRlclJhZGl1czogNixcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgcmdiYSgxMjgsMTI4LDEyOCwwLjMpJywgYmFja2dyb3VuZDogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTMsIGNvbG9yOiAnaW5oZXJpdCcsIGJveFNpemluZzogJ2JvcmRlci1ib3gnLFxuICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgbG9hZGluZyAmJiByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTIsIG9wYWNpdHk6IDAuNiB9IH0sIFwiTG9hZGluZyBza2lsbHNcXHUyMDI2XCIpLFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IG1heEhlaWdodDogMjIwLCBvdmVyZmxvd1k6ICdhdXRvJywgYm9yZGVyOiAnMXB4IHNvbGlkIHJnYmEoMTI4LDEyOCwxMjgsMC4yKScsIGJvcmRlclJhZGl1czogNiwgcGFkZGluZzogOCB9IH0sXG4gICAgICAgICAgICBjYXRlZ29yaWVzLm1hcCgoY2F0KSA9PiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBrZXk6IGNhdCwgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAxMCB9IH0sXG4gICAgICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTAsIGZvbnRXZWlnaHQ6IDcwMCwgdGV4dFRyYW5zZm9ybTogJ3VwcGVyY2FzZScsIGxldHRlclNwYWNpbmc6IDEsIG9wYWNpdHk6IDAuNSwgbWFyZ2luQm90dG9tOiA0IH0gfSwgY2F0KSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJlZC5maWx0ZXIoKHMpID0+IHMuY2F0ZWdvcnkgPT09IGNhdCkubWFwKChza2lsbCkgPT4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiwgeyBrZXk6IHNraWxsLmlkLCBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6IDYsIGZvbnRTaXplOiAxMywgY3Vyc29yOiAncG9pbnRlcicsIHBhZGRpbmc6ICcycHggMCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBzZWxlY3RlZC5pbmNsdWRlcyhza2lsbC5pZCksIG9uQ2hhbmdlOiAoKSA9PiB0b2dnbGUoc2tpbGwuaWQpLCBzdHlsZTogeyB3aWR0aDogMTQsIGhlaWdodDogMTQgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgc2tpbGwubmFtZSkpKSkpKSxcbiAgICAgICAgICAgIGZpbHRlcmVkLmxlbmd0aCA9PT0gMCAmJiAhbG9hZGluZyAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHsgc3R5bGU6IHsgZm9udFNpemU6IDEyLCBvcGFjaXR5OiAwLjUgfSB9LCBcIk5vIHNraWxscyBmb3VuZC5cIikpKSkpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2tpbGwtcGlja2VyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBvd25LZXlzID0gZnVuY3Rpb24obykge1xuICAgICAgICBvd25LZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgIHZhciBhciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBvKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspKSBhclthci5sZW5ndGhdID0gaztcbiAgICAgICAgICAgIHJldHVybiBhcjtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG93bktleXMobyk7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1vZCkge1xuICAgICAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayA9IG93bktleXMobW9kKSwgaSA9IDA7IGkgPCBrLmxlbmd0aDsgaSsrKSBpZiAoa1tpXSAhPT0gXCJkZWZhdWx0XCIpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwga1tpXSk7XG4gICAgICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBNZWRpYVVwbG9hZGVyO1xuY29uc3QgcmVhY3RfMSA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwicmVhY3RcIikpO1xuZnVuY3Rpb24gTWVkaWFVcGxvYWRlcih7IHByb3BlcnR5LCByZWNvcmQsIG9uQ2hhbmdlIH0pIHtcbiAgICBjb25zdCBhcGlCYXNlID0gd2luZG93Ll9fQVBJX0JBU0VfX1xuICAgICAgICA/PyBgJHt3aW5kb3cubG9jYXRpb24ucHJvdG9jb2x9Ly8ke3dpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZX06MzAwMWA7XG4gICAgY29uc3QgaW5pdGlhbCA9IFtdO1xuICAgIGlmIChyZWNvcmQ/LnBhcmFtcykge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIHdoaWxlIChyZWNvcmQucGFyYW1zW2Ake3Byb3BlcnR5LnBhdGh9LiR7aX0udXJsYF0pIHtcbiAgICAgICAgICAgIGluaXRpYWwucHVzaCh7XG4gICAgICAgICAgICAgICAgaWQ6IHJlY29yZC5wYXJhbXNbYCR7cHJvcGVydHkucGF0aH0uJHtpfS5pZGBdID8/IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB1cmw6IHJlY29yZC5wYXJhbXNbYCR7cHJvcGVydHkucGF0aH0uJHtpfS51cmxgXSxcbiAgICAgICAgICAgICAgICBhbHRUZXh0OiByZWNvcmQucGFyYW1zW2Ake3Byb3BlcnR5LnBhdGh9LiR7aX0uYWx0VGV4dGBdID8/ICcnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgW2l0ZW1zLCBzZXRJdGVtc10gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoaW5pdGlhbCk7XG4gICAgY29uc3QgW2RyYWdnaW5nLCBzZXREcmFnZ2luZ10gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoZmFsc2UpO1xuICAgIGNvbnN0IGRyYWdJZHggPSAoMCwgcmVhY3RfMS51c2VSZWYpKG51bGwpO1xuICAgIGNvbnN0IGZpbGVSZWYgPSAoMCwgcmVhY3RfMS51c2VSZWYpKG51bGwpO1xuICAgIGNvbnN0IGVtaXQgPSAoMCwgcmVhY3RfMS51c2VDYWxsYmFjaykoKG5leHQpID0+IHtcbiAgICAgICAgc2V0SXRlbXMobmV4dCk7XG4gICAgICAgIG9uQ2hhbmdlKHByb3BlcnR5LnBhdGgsIG5leHQuZmlsdGVyKChtKSA9PiAhbS51cGxvYWRpbmcgJiYgIW0uZXJyb3IpKTtcbiAgICB9LCBbb25DaGFuZ2UsIHByb3BlcnR5LnBhdGhdKTtcbiAgICBjb25zdCB1cGxvYWRGaWxlcyA9IGFzeW5jIChmaWxlcykgPT4ge1xuICAgICAgICBpZiAoIWZpbGVzIHx8ICFmaWxlcy5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IHBsYWNlaG9sZGVycyA9IEFycmF5LmZyb20oZmlsZXMpLm1hcCgoZikgPT4gKHtcbiAgICAgICAgICAgIHVybDogVVJMLmNyZWF0ZU9iamVjdFVSTChmKSwgYWx0VGV4dDogJycsIHVwbG9hZGluZzogdHJ1ZSxcbiAgICAgICAgfSkpO1xuICAgICAgICBzZXRJdGVtcygocHJldikgPT4gWy4uLnByZXYsIC4uLnBsYWNlaG9sZGVyc10pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlID0gZmlsZXNbaV07XG4gICAgICAgICAgICBjb25zdCBmZCA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICAgICAgZmQuYXBwZW5kKCdmaWxlJywgZmlsZSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke2FwaUJhc2V9L3YxL3VwbG9hZGAsIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IGZkLCBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICghcmVzLm9rKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVwbG9hZCBmYWlsZWQ6ICR7cmVzLnN0YXR1c31gKTtcbiAgICAgICAgICAgICAgICBjb25zdCB7IHVybCB9ID0gYXdhaXQgcmVzLmpzb24oKTtcbiAgICAgICAgICAgICAgICBzZXRJdGVtcygocHJldikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gWy4uLnByZXZdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBuZXh0LmZpbmRJbmRleCgobSkgPT4gbS51cGxvYWRpbmcgJiYgbS51cmwgPT09IHBsYWNlaG9sZGVyc1tpXS51cmwpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaWR4ICE9PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRbaWR4XSA9IHsgdXJsLCBhbHRUZXh0OiAnJywgdXBsb2FkaW5nOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZShwcm9wZXJ0eS5wYXRoLCBuZXh0LmZpbHRlcigobSkgPT4gIW0udXBsb2FkaW5nKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHNldEl0ZW1zKChwcmV2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSBbLi4ucHJldl07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IG5leHQuZmluZEluZGV4KChtKSA9PiBtLnVwbG9hZGluZyAmJiBtLnVybCA9PT0gcGxhY2Vob2xkZXJzW2ldLnVybCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZHggIT09IC0xKVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFtpZHhdID0geyAuLi5uZXh0W2lkeF0sIHVwbG9hZGluZzogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3Qgb25EcmFnU3RhcnQgPSAoaSkgPT4geyBkcmFnSWR4LmN1cnJlbnQgPSBpOyB9O1xuICAgIGNvbnN0IG9uRHJhZ092ZXIgPSAoZSwgaSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChkcmFnSWR4LmN1cnJlbnQgPT09IG51bGwgfHwgZHJhZ0lkeC5jdXJyZW50ID09PSBpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzZXRJdGVtcygocHJldikgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV4dCA9IFsuLi5wcmV2XTtcbiAgICAgICAgICAgIGNvbnN0IFttb3ZlZF0gPSBuZXh0LnNwbGljZShkcmFnSWR4LmN1cnJlbnQsIDEpO1xuICAgICAgICAgICAgbmV4dC5zcGxpY2UoaSwgMCwgbW92ZWQpO1xuICAgICAgICAgICAgZHJhZ0lkeC5jdXJyZW50ID0gaTtcbiAgICAgICAgICAgIG9uQ2hhbmdlKHByb3BlcnR5LnBhdGgsIG5leHQuZmlsdGVyKChtKSA9PiAhbS51cGxvYWRpbmcpKTtcbiAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIGNvbnN0IG9uRHJvcFpvbmUgPSAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNldERyYWdnaW5nKGZhbHNlKTtcbiAgICAgICAgdXBsb2FkRmlsZXMoZS5kYXRhVHJhbnNmZXIuZmlsZXMpO1xuICAgIH07XG4gICAgcmV0dXJuIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogMTIgfSB9LFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IG9uRHJhZ092ZXI6IChlKSA9PiB7IGUucHJldmVudERlZmF1bHQoKTsgc2V0RHJhZ2dpbmcodHJ1ZSk7IH0sIG9uRHJhZ0xlYXZlOiAoKSA9PiBzZXREcmFnZ2luZyhmYWxzZSksIG9uRHJvcDogb25Ecm9wWm9uZSwgb25DbGljazogKCkgPT4gZmlsZVJlZi5jdXJyZW50Py5jbGljaygpLCBzdHlsZToge1xuICAgICAgICAgICAgICAgIGJvcmRlcjogYDJweCBkYXNoZWQgJHtkcmFnZ2luZyA/ICcjODE4Y2Y4JyA6ICdyZ2JhKDEyOCwxMjgsMTI4LDAuMyknfWAsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA4LCBwYWRkaW5nOiAnMjRweCAxNnB4JywgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJywgYmFja2dyb3VuZDogZHJhZ2dpbmcgPyAncmdiYSg5OSwxMDIsMjQxLDAuMDUpJyA6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2FsbCAxNTBtcycsXG4gICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTMsIG9wYWNpdHk6IDAuNyB9IH0sXG4gICAgICAgICAgICAgICAgXCJEcm9wIGltYWdlcyBoZXJlIG9yIFwiLFxuICAgICAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwic3Ryb25nXCIsIG51bGwsIFwiY2xpY2sgdG8gYnJvd3NlXCIpKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyByZWY6IGZpbGVSZWYsIHR5cGU6IFwiZmlsZVwiLCBtdWx0aXBsZTogdHJ1ZSwgYWNjZXB0OiBcImltYWdlLypcIiwgc3R5bGU6IHsgZGlzcGxheTogJ25vbmUnIH0sIG9uQ2hhbmdlOiAoZSkgPT4gdXBsb2FkRmlsZXMoZS50YXJnZXQuZmlsZXMpIH0pKSxcbiAgICAgICAgaXRlbXMubGVuZ3RoID4gMCAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZ3JpZCcsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maWxsLCBtaW5tYXgoMTIwcHgsIDFmcikpJywgZ2FwOiA4IH0gfSwgaXRlbXMubWFwKChpdGVtLCBpKSA9PiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBrZXk6IGksIGRyYWdnYWJsZTogIWl0ZW0udXBsb2FkaW5nLCBvbkRyYWdTdGFydDogKCkgPT4gb25EcmFnU3RhcnQoaSksIG9uRHJhZ092ZXI6IChlKSA9PiBvbkRyYWdPdmVyKGUsIGkpLCBzdHlsZToge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLCBib3JkZXJSYWRpdXM6IDgsIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgcmdiYSgxMjgsMTI4LDEyOCwwLjIpJywgY3Vyc29yOiBpdGVtLnVwbG9hZGluZyA/ICdkZWZhdWx0JyA6ICdncmFiJyxcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiBpdGVtLnVwbG9hZGluZyA/IDAuNiA6IDEsXG4gICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImltZ1wiLCB7IHNyYzogaXRlbS51cmwsIGFsdDogaXRlbS5hbHRUZXh0LCBzdHlsZTogeyB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6IDgwLCBvYmplY3RGaXQ6ICdjb3ZlcicsIGRpc3BsYXk6ICdibG9jaycgfSB9KSxcbiAgICAgICAgICAgIGl0ZW0udXBsb2FkaW5nICYmIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IHBvc2l0aW9uOiAnYWJzb2x1dGUnLCBpbnNldDogMCwgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBiYWNrZ3JvdW5kOiAncmdiYSgwLDAsMCwwLjQpJywgZm9udFNpemU6IDEwLCBjb2xvcjogJyNmZmYnIH0gfSwgXCJVcGxvYWRpbmdcXHUyMDI2XCIpKSxcbiAgICAgICAgICAgIGl0ZW0uZXJyb3IgJiYgKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgcG9zaXRpb246ICdhYnNvbHV0ZScsIGluc2V0OiAwLCBiYWNrZ3JvdW5kOiAncmdiYSgyMjAsMzgsMzgsMC43KScsIGZvbnRTaXplOiA5LCBjb2xvcjogJyNmZmYnLCBwYWRkaW5nOiA0LCBvdmVyZmxvdzogJ2hpZGRlbicgfSB9LCBpdGVtLmVycm9yKSksXG4gICAgICAgICAgICAhaXRlbS51cGxvYWRpbmcgJiYgKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KHJlYWN0XzEuZGVmYXVsdC5GcmFnbWVudCwgbnVsbCxcbiAgICAgICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgdHlwZTogXCJ0ZXh0XCIsIHBsYWNlaG9sZGVyOiBcIkFsdCB0ZXh0XCIsIHZhbHVlOiBpdGVtLmFsdFRleHQsIG9uQ2hhbmdlOiAoZSkgPT4gZW1pdChpdGVtcy5tYXAoKGl0LCBqKSA9PiBqID09PSBpID8geyAuLi5pdCwgYWx0VGV4dDogZS50YXJnZXQudmFsdWUgfSA6IGl0KSksIHN0eWxlOiB7IHdpZHRoOiAnMTAwJScsIGZvbnRTaXplOiAxMCwgcGFkZGluZzogJzNweCA2cHgnLCBib3JkZXI6ICdub25lJywgYm9yZGVyVG9wOiAnMXB4IHNvbGlkIHJnYmEoMTI4LDEyOCwxMjgsMC4yKScsIGJhY2tncm91bmQ6ICd0cmFuc3BhcmVudCcsIGJveFNpemluZzogJ2JvcmRlci1ib3gnIH0gfSksXG4gICAgICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwgeyBvbkNsaWNrOiAoKSA9PiBlbWl0KGl0ZW1zLmZpbHRlcigoXywgaikgPT4gaiAhPT0gaSkpLCBzdHlsZTogeyBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiA0LCByaWdodDogNCwgYmFja2dyb3VuZDogJ3JnYmEoMjIwLDM4LDM4LDAuOCknLCBib3JkZXI6ICdub25lJywgYm9yZGVyUmFkaXVzOiA0LCBjb2xvcjogJyNmZmYnLCBmb250U2l6ZTogMTAsIGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMXB4IDVweCcgfSwgdGl0bGU6IFwiUmVtb3ZlXCIgfSwgXCJcXHUyNzE1XCIpKSkpKSkpKSkpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWVkaWEtdXBsb2FkZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcbiAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19zZXRNb2R1bGVEZWZhdWx0KSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xufSkgOiBmdW5jdGlvbihvLCB2KSB7XG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xufSk7XG52YXIgX19pbXBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydFN0YXIpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG93bktleXMgPSBmdW5jdGlvbihvKSB7XG4gICAgICAgIG93bktleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgdmFyIGFyID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBrIGluIG8pIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobywgaykpIGFyW2FyLmxlbmd0aF0gPSBrO1xuICAgICAgICAgICAgcmV0dXJuIGFyO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gb3duS2V5cyhvKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAobW9kKSB7XG4gICAgICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrID0gb3duS2V5cyhtb2QpLCBpID0gMDsgaSA8IGsubGVuZ3RoOyBpKyspIGlmIChrW2ldICE9PSBcImRlZmF1bHRcIikgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrW2ldKTtcbiAgICAgICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xufSkoKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IFZpZGVvTWFuYWdlcjtcbmNvbnN0IHJlYWN0XzEgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcInJlYWN0XCIpKTtcbmZ1bmN0aW9uIGRldGVjdFNvdXJjZSh1cmwpIHtcbiAgICBpZiAoL3lvdXR1KFxcLmJlfGJlXFwuY29tKS9pLnRlc3QodXJsKSlcbiAgICAgICAgcmV0dXJuICd5b3V0dWJlJztcbiAgICBpZiAoL3ZpbWVvXFwuY29tL2kudGVzdCh1cmwpKVxuICAgICAgICByZXR1cm4gJ3ZpbWVvJztcbiAgICByZXR1cm4gJ3NlbGZfaG9zdGVkJztcbn1cbmZ1bmN0aW9uIFZpZGVvTWFuYWdlcih7IHByb3BlcnR5LCByZWNvcmQsIG9uQ2hhbmdlIH0pIHtcbiAgICBjb25zdCBpbml0aWFsID0gW107XG4gICAgaWYgKHJlY29yZD8ucGFyYW1zKSB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgd2hpbGUgKHJlY29yZC5wYXJhbXNbYCR7cHJvcGVydHkucGF0aH0uJHtpfS51cmxgXSkge1xuICAgICAgICAgICAgaW5pdGlhbC5wdXNoKHtcbiAgICAgICAgICAgICAgICBpZDogcmVjb3JkLnBhcmFtc1tgJHtwcm9wZXJ0eS5wYXRofS4ke2l9LmlkYF0gPz8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogKHJlY29yZC5wYXJhbXNbYCR7cHJvcGVydHkucGF0aH0uJHtpfS5zb3VyY2VgXSA/PyAnc2VsZl9ob3N0ZWQnKSxcbiAgICAgICAgICAgICAgICB1cmw6IHJlY29yZC5wYXJhbXNbYCR7cHJvcGVydHkucGF0aH0uJHtpfS51cmxgXSxcbiAgICAgICAgICAgICAgICB0aXRsZTogcmVjb3JkLnBhcmFtc1tgJHtwcm9wZXJ0eS5wYXRofS4ke2l9LnRpdGxlYF0gPz8gJycsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBbaXRlbXMsIHNldEl0ZW1zXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShpbml0aWFsKTtcbiAgICBjb25zdCBbbmV3VXJsLCBzZXROZXdVcmxdID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKCcnKTtcbiAgICBjb25zdCBbbmV3VGl0bGUsIHNldE5ld1RpdGxlXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKSgnJyk7XG4gICAgY29uc3QgZHJhZ0lkeCA9ICgwLCByZWFjdF8xLnVzZVJlZikobnVsbCk7XG4gICAgY29uc3QgZW1pdCA9ICgwLCByZWFjdF8xLnVzZUNhbGxiYWNrKSgobmV4dCkgPT4ge1xuICAgICAgICBzZXRJdGVtcyhuZXh0KTtcbiAgICAgICAgb25DaGFuZ2UocHJvcGVydHkucGF0aCwgbmV4dCk7XG4gICAgfSwgW29uQ2hhbmdlLCBwcm9wZXJ0eS5wYXRoXSk7XG4gICAgY29uc3QgYWRkSXRlbSA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gbmV3VXJsLnRyaW0oKTtcbiAgICAgICAgaWYgKCF1cmwpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB7IHNvdXJjZTogZGV0ZWN0U291cmNlKHVybCksIHVybCwgdGl0bGU6IG5ld1RpdGxlLnRyaW0oKSB9O1xuICAgICAgICBlbWl0KFsuLi5pdGVtcywgaXRlbV0pO1xuICAgICAgICBzZXROZXdVcmwoJycpO1xuICAgICAgICBzZXROZXdUaXRsZSgnJyk7XG4gICAgfTtcbiAgICBjb25zdCBvbkRyYWdTdGFydCA9IChpKSA9PiB7IGRyYWdJZHguY3VycmVudCA9IGk7IH07XG4gICAgY29uc3Qgb25EcmFnT3ZlciA9IChlLCBpKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKGRyYWdJZHguY3VycmVudCA9PT0gbnVsbCB8fCBkcmFnSWR4LmN1cnJlbnQgPT09IGkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IG5leHQgPSBbLi4uaXRlbXNdO1xuICAgICAgICBjb25zdCBbbW92ZWRdID0gbmV4dC5zcGxpY2UoZHJhZ0lkeC5jdXJyZW50LCAxKTtcbiAgICAgICAgbmV4dC5zcGxpY2UoaSwgMCwgbW92ZWQpO1xuICAgICAgICBkcmFnSWR4LmN1cnJlbnQgPSBpO1xuICAgICAgICBlbWl0KG5leHQpO1xuICAgIH07XG4gICAgY29uc3QgbGFiZWxTdHlsZSA9IHtcbiAgICAgICAgZm9udFNpemU6IDEwLCBmb250V2VpZ2h0OiA3MDAsIHRleHRUcmFuc2Zvcm06ICd1cHBlcmNhc2UnLCBsZXR0ZXJTcGFjaW5nOiAxLCBvcGFjaXR5OiAwLjUsIG1hcmdpbkJvdHRvbTogNCxcbiAgICB9O1xuICAgIGNvbnN0IGlucHV0U3R5bGUgPSB7XG4gICAgICAgIHdpZHRoOiAnMTAwJScsIHBhZGRpbmc6ICc2cHggMTBweCcsIGJvcmRlclJhZGl1czogNiwgYm9yZGVyOiAnMXB4IHNvbGlkIHJnYmEoMTI4LDEyOCwxMjgsMC4zKScsXG4gICAgICAgIGJhY2tncm91bmQ6ICd0cmFuc3BhcmVudCcsIGZvbnRTaXplOiAxMywgY29sb3I6ICdpbmhlcml0JywgYm94U2l6aW5nOiAnYm9yZGVyLWJveCcsXG4gICAgfTtcbiAgICByZXR1cm4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAxMiB9IH0sXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IDYwMCwgdGV4dFRyYW5zZm9ybTogJ3VwcGVyY2FzZScsIGxldHRlclNwYWNpbmc6IDEsIG9wYWNpdHk6IDAuNyB9IH0sIHByb3BlcnR5LnBhdGguY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wZXJ0eS5wYXRoLnNsaWNlKDEpKSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6IDYsIHBhZGRpbmc6IDEyLCBib3JkZXJSYWRpdXM6IDgsIGJvcmRlcjogJzFweCBzb2xpZCByZ2JhKDEyOCwxMjgsMTI4LDAuMiknIH0gfSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IGxhYmVsU3R5bGUgfSwgXCJBZGQgdmlkZW9cIiksXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgdHlwZTogXCJ1cmxcIiwgcGxhY2Vob2xkZXI6IFwiWW91VHViZSwgVmltZW8sIG9yIE1QNCBVUkxcIiwgdmFsdWU6IG5ld1VybCwgb25DaGFuZ2U6IChlKSA9PiBzZXROZXdVcmwoZS50YXJnZXQudmFsdWUpLCBvbktleURvd246IChlKSA9PiBlLmtleSA9PT0gJ0VudGVyJyAmJiBhZGRJdGVtKCksIHN0eWxlOiBpbnB1dFN0eWxlIH0pLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7IHR5cGU6IFwidGV4dFwiLCBwbGFjZWhvbGRlcjogXCJUaXRsZSAob3B0aW9uYWwpXCIsIHZhbHVlOiBuZXdUaXRsZSwgb25DaGFuZ2U6IChlKSA9PiBzZXROZXdUaXRsZShlLnRhcmdldC52YWx1ZSksIG9uS2V5RG93bjogKGUpID0+IGUua2V5ID09PSAnRW50ZXInICYmIGFkZEl0ZW0oKSwgc3R5bGU6IGlucHV0U3R5bGUgfSksXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6IGFkZEl0ZW0sIHN0eWxlOiB7IGFsaWduU2VsZjogJ2ZsZXgtc3RhcnQnLCBwYWRkaW5nOiAnNnB4IDE0cHgnLCBib3JkZXJSYWRpdXM6IDYsIGJvcmRlcjogJ25vbmUnLCBjdXJzb3I6ICdwb2ludGVyJywgYmFja2dyb3VuZDogJyM2MzY2ZjEnLCBjb2xvcjogJyNmZmYnLCBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IDYwMCB9IH0sIFwiKyBBZGRcIikpLFxuICAgICAgICBpdGVtcy5sZW5ndGggPiAwICYmIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogNiB9IH0sIGl0ZW1zLm1hcCgoaXRlbSwgaSkgPT4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsga2V5OiBpLCBkcmFnZ2FibGU6IHRydWUsIG9uRHJhZ1N0YXJ0OiAoKSA9PiBvbkRyYWdTdGFydChpKSwgb25EcmFnT3ZlcjogKGUpID0+IG9uRHJhZ092ZXIoZSwgaSksIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiA4LFxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc4cHggMTBweCcsIGJvcmRlclJhZGl1czogOCxcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgcmdiYSgxMjgsMTI4LDEyOCwwLjIpJyxcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdncmFiJyxcbiAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7IHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiA5LCBwYWRkaW5nOiAnMnB4IDZweCcsIGJvcmRlclJhZGl1czogNCwgZm9udFdlaWdodDogNzAwLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBpdGVtLnNvdXJjZSA9PT0gJ3lvdXR1YmUnID8gJ3JnYmEoMjIwLDM4LDM4LDAuMTUpJ1xuICAgICAgICAgICAgICAgICAgICAgICAgOiBpdGVtLnNvdXJjZSA9PT0gJ3ZpbWVvJyA/ICdyZ2JhKDE0LDE2NSwyMzMsMC4xNSknIDogJ3JnYmEoOTksMTAyLDI0MSwwLjE1KScsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBpdGVtLnNvdXJjZSA9PT0gJ3lvdXR1YmUnID8gJyNkYzI2MjYnXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGl0ZW0uc291cmNlID09PSAndmltZW8nID8gJyMwZWE1ZTknIDogJyM2MzY2ZjEnLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0VHJhbnNmb3JtOiAndXBwZXJjYXNlJywgbGV0dGVyU3BhY2luZzogMSwgZmxleFNocmluazogMCxcbiAgICAgICAgICAgICAgICB9IH0sIGl0ZW0uc291cmNlLnJlcGxhY2UoJ18nLCAnICcpKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZmxleDogMSwgb3ZlcmZsb3c6ICdoaWRkZW4nIH0gfSxcbiAgICAgICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogNTAwLCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgb3ZlcmZsb3c6ICdoaWRkZW4nLCB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycgfSB9LCBpdGVtLnRpdGxlIHx8IGl0ZW0udXJsKSxcbiAgICAgICAgICAgICAgICBpdGVtLnRpdGxlICYmIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMCwgb3BhY2l0eTogMC41LCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgb3ZlcmZsb3c6ICdoaWRkZW4nLCB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycgfSB9LCBpdGVtLnVybCkpKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiwgcGxhY2Vob2xkZXI6IFwiVGl0bGVcIiwgdmFsdWU6IGl0ZW0udGl0bGUsIG9uQ2hhbmdlOiAoZSkgPT4gZW1pdChpdGVtcy5tYXAoKGl0LCBqKSA9PiBqID09PSBpID8geyAuLi5pdCwgdGl0bGU6IGUudGFyZ2V0LnZhbHVlIH0gOiBpdCkpLCBzdHlsZTogeyAuLi5pbnB1dFN0eWxlLCB3aWR0aDogMTIwLCBmbGV4U2hyaW5rOiAwIH0gfSksXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6ICgpID0+IGVtaXQoaXRlbXMuZmlsdGVyKChfLCBqKSA9PiBqICE9PSBpKSksIHN0eWxlOiB7IGZsZXhTaHJpbms6IDAsIGJhY2tncm91bmQ6ICdyZ2JhKDIyMCwzOCwzOCwwLjE1KScsIGJvcmRlcjogJ25vbmUnLCBib3JkZXJSYWRpdXM6IDQsIGNvbG9yOiAnI2RjMjYyNicsIGZvbnRTaXplOiAxMSwgY3Vyc29yOiAncG9pbnRlcicsIHBhZGRpbmc6ICczcHggN3B4JyB9IH0sIFwiXFx1MjcxNVwiKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7IHN0eWxlOiB7IGZsZXhTaHJpbms6IDAsIG9wYWNpdHk6IDAuMywgZm9udFNpemU6IDE0LCBjdXJzb3I6ICdncmFiJyB9IH0sIFwiXFx1MjgzRlwiKSkpKSkpKSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD12aWRlby1tYW5hZ2VyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBvd25LZXlzID0gZnVuY3Rpb24obykge1xuICAgICAgICBvd25LZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgIHZhciBhciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBvKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspKSBhclthci5sZW5ndGhdID0gaztcbiAgICAgICAgICAgIHJldHVybiBhcjtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG93bktleXMobyk7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1vZCkge1xuICAgICAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayA9IG93bktleXMobW9kKSwgaSA9IDA7IGkgPCBrLmxlbmd0aDsgaSsrKSBpZiAoa1tpXSAhPT0gXCJkZWZhdWx0XCIpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwga1tpXSk7XG4gICAgICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBQaG90b1VwbG9hZGVyO1xuY29uc3QgcmVhY3RfMSA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwicmVhY3RcIikpO1xuZnVuY3Rpb24gUGhvdG9VcGxvYWRlcih7IHByb3BlcnR5LCByZWNvcmQsIG9uQ2hhbmdlIH0pIHtcbiAgICBjb25zdCBhcGlCYXNlID0gd2luZG93Ll9fQVBJX0JBU0VfX1xuICAgICAgICA/PyBgJHt3aW5kb3cubG9jYXRpb24ucHJvdG9jb2x9Ly8ke3dpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZX06MzAwMWA7XG4gICAgY29uc3QgZXhpc3RpbmdVcmwgPSByZWNvcmQ/LnBhcmFtcz8uW3Byb3BlcnR5LnBhdGhdID8/ICcnO1xuICAgIGNvbnN0IFtpdGVtcywgc2V0SXRlbXNdID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKFtdKTtcbiAgICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShmYWxzZSk7XG4gICAgY29uc3QgZmlsZVJlZiA9ICgwLCByZWFjdF8xLnVzZVJlZikobnVsbCk7XG4gICAgY29uc3QgdXBkYXRlID0gKDAsIHJlYWN0XzEudXNlQ2FsbGJhY2spKChpZHgsIHBhdGNoKSA9PiBzZXRJdGVtcyhwcmV2ID0+IHByZXYubWFwKChpdCwgaSkgPT4gaSA9PT0gaWR4ID8geyAuLi5pdCwgLi4ucGF0Y2ggfSA6IGl0KSksIFtdKTtcbiAgICBjb25zdCB1cGxvYWRPbmUgPSAoMCwgcmVhY3RfMS51c2VDYWxsYmFjaykoYXN5bmMgKGl0ZW0sIGlkeCkgPT4ge1xuICAgICAgICB1cGRhdGUoaWR4LCB7IHN0YXRlOiAndXBsb2FkaW5nJywgcHJvZ3Jlc3M6IDAgfSk7XG4gICAgICAgIGNvbnN0IGZkID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgIGZkLmFwcGVuZCgnZmlsZScsIGl0ZW0uZmlsZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZShpZHgsIHsgcHJvZ3Jlc3M6IE1hdGgucm91bmQoKGUubG9hZGVkIC8gZS50b3RhbCkgKiA5MCkgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPj0gMjAwICYmIHhoci5zdGF0dXMgPCAzMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlKGlkeCwgeyBzdGF0ZTogJ2RvbmUnLCBwcm9ncmVzczogMTAwLCByZXN1bHRVcmw6IGRhdGEub3JpZ2luYWxVcmwgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2UocHJvcGVydHkucGF0aCwgZGF0YS5vcmlnaW5hbFVybCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0ludmFsaWQgSlNPTiByZXNwb25zZScpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFVwbG9hZCBmYWlsZWQ6IEhUVFAgJHt4aHIuc3RhdHVzfWApKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsICgpID0+IHJlamVjdChuZXcgRXJyb3IoJ05ldHdvcmsgZXJyb3InKSkpO1xuICAgICAgICAgICAgICAgIHhoci5vcGVuKCdQT1NUJywgYCR7YXBpQmFzZX0vdjEvZ2FsbGVyeS9waG90b3MvdXBsb2FkYCk7XG4gICAgICAgICAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgICAgICAgICAgICAgeGhyLnNlbmQoZmQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdXBkYXRlKGlkeCwgeyBzdGF0ZTogJ2Vycm9yJywgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2FwaUJhc2UsIG9uQ2hhbmdlLCBwcm9wZXJ0eS5wYXRoLCB1cGRhdGVdKTtcbiAgICBjb25zdCBhZGRGaWxlcyA9ICgwLCByZWFjdF8xLnVzZUNhbGxiYWNrKSgoZmlsZUxpc3QpID0+IHtcbiAgICAgICAgaWYgKCFmaWxlTGlzdClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgYWxsb3dlZCA9IE1hdGgubWluKGZpbGVMaXN0Lmxlbmd0aCwgNTAgLSBpdGVtcy5sZW5ndGgpO1xuICAgICAgICBjb25zdCBuZXdJdGVtcyA9IEFycmF5LmZyb20oZmlsZUxpc3QpLnNsaWNlKDAsIGFsbG93ZWQpLm1hcChmID0+ICh7XG4gICAgICAgICAgICBmaWxlOiBmLFxuICAgICAgICAgICAgbG9jYWxVcmw6IFVSTC5jcmVhdGVPYmplY3RVUkwoZiksXG4gICAgICAgICAgICBzdGF0ZTogJ3BlbmRpbmcnLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IDAsXG4gICAgICAgIH0pKTtcbiAgICAgICAgc2V0SXRlbXMocHJldiA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXh0ID0gWy4uLnByZXYsIC4uLm5ld0l0ZW1zXTtcbiAgICAgICAgICAgIG5ld0l0ZW1zLmZvckVhY2goKGl0LCBpKSA9PiB2b2lkIHVwbG9hZE9uZShpdCwgcHJldi5sZW5ndGggKyBpKSk7XG4gICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfSk7XG4gICAgfSwgW2l0ZW1zLmxlbmd0aCwgdXBsb2FkT25lXSk7XG4gICAgY29uc3Qgc3RhdGVDb2xvciA9IHtcbiAgICAgICAgcGVuZGluZzogJyM2YjcyODAnLFxuICAgICAgICB1cGxvYWRpbmc6ICcjNjM2NmYxJyxcbiAgICAgICAgZG9uZTogJyMyMmM1NWUnLFxuICAgICAgICBlcnJvcjogJyNlZjQ0NDQnLFxuICAgIH07XG4gICAgcmV0dXJuIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogMTIgfSB9LFxuICAgICAgICBleGlzdGluZ1VybCAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIiwgeyBzcmM6IGV4aXN0aW5nVXJsLCBhbHQ6IFwiQ3VycmVudFwiLCBzdHlsZTogeyB3aWR0aDogMTIwLCBoZWlnaHQ6IDgwLCBvYmplY3RGaXQ6ICdjb3ZlcicsIGJvcmRlclJhZGl1czogNiwgYm9yZGVyOiAnMXB4IHNvbGlkIHJnYmEoMTI4LDEyOCwxMjgsMC4yKScgfSB9KSksXG4gICAgICAgIGl0ZW1zLmxlbmd0aCA8IDUwICYmIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IG9uRHJhZ092ZXI6IGUgPT4geyBlLnByZXZlbnREZWZhdWx0KCk7IHNldERyYWdnaW5nKHRydWUpOyB9LCBvbkRyYWdMZWF2ZTogKCkgPT4gc2V0RHJhZ2dpbmcoZmFsc2UpLCBvbkRyb3A6IGUgPT4geyBlLnByZXZlbnREZWZhdWx0KCk7IHNldERyYWdnaW5nKGZhbHNlKTsgYWRkRmlsZXMoZS5kYXRhVHJhbnNmZXIuZmlsZXMpOyB9LCBvbkNsaWNrOiAoKSA9PiBmaWxlUmVmLmN1cnJlbnQ/LmNsaWNrKCksIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgYm9yZGVyOiBgMnB4IGRhc2hlZCAke2RyYWdnaW5nID8gJyM4MThjZjgnIDogJ3JnYmEoMTI4LDEyOCwxMjgsMC4zKSd9YCxcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDgsIHBhZGRpbmc6ICcyMHB4IDE2cHgnLCB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLCBiYWNrZ3JvdW5kOiBkcmFnZ2luZyA/ICdyZ2JhKDk5LDEwMiwyNDEsMC4wNSknIDogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMywgb3BhY2l0eTogMC43IH0gfSxcbiAgICAgICAgICAgICAgICBcIkRyb3AgcGhvdG9zIGhlcmUgb3IgXCIsXG4gICAgICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJzdHJvbmdcIiwgbnVsbCwgXCJjbGljayB0byBicm93c2VcIiksXG4gICAgICAgICAgICAgICAgXCIgKG1heCA1MClcIiksXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgcmVmOiBmaWxlUmVmLCB0eXBlOiBcImZpbGVcIiwgbXVsdGlwbGU6IHRydWUsIGFjY2VwdDogXCJpbWFnZS9qcGVnLGltYWdlL3BuZyxpbWFnZS93ZWJwLGltYWdlL2dpZlwiLCBzdHlsZTogeyBkaXNwbGF5OiAnbm9uZScgfSwgb25DaGFuZ2U6IGUgPT4gYWRkRmlsZXMoZS50YXJnZXQuZmlsZXMpIH0pKSksXG4gICAgICAgIGl0ZW1zLmxlbmd0aCA+IDAgJiYgKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiA4IH0gfSwgaXRlbXMubWFwKChpdGVtLCBpKSA9PiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBrZXk6IGksIHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogMTAgfSB9LFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIiwgeyBzcmM6IGl0ZW0ucmVzdWx0VXJsID8/IGl0ZW0ubG9jYWxVcmwsIGFsdDogaXRlbS5maWxlLm5hbWUsIHN0eWxlOiB7IHdpZHRoOiA0OCwgaGVpZ2h0OiAzNiwgb2JqZWN0Rml0OiAnY292ZXInLCBib3JkZXJSYWRpdXM6IDQsIGZsZXhTaHJpbms6IDAgfSB9KSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZmxleDogMSwgbWluV2lkdGg6IDAgfSB9LFxuICAgICAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZm9udFNpemU6IDExLCBvcGFjaXR5OiAwLjgsIHdoaXRlU3BhY2U6ICdub3dyYXAnLCBvdmVyZmxvdzogJ2hpZGRlbicsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJyB9IH0sIGl0ZW0uZmlsZS5uYW1lKSxcbiAgICAgICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGhlaWdodDogNCwgYm9yZGVyUmFkaXVzOiAyLCBiYWNrZ3JvdW5kOiAncmdiYSgxMjgsMTI4LDEyOCwwLjIpJywgbWFyZ2luVG9wOiA0IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLCBib3JkZXJSYWRpdXM6IDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGAke2l0ZW0ucHJvZ3Jlc3N9JWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogc3RhdGVDb2xvcltpdGVtLnN0YXRlXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnd2lkdGggMC4xNXMgZWFzZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB9IH0pKSxcbiAgICAgICAgICAgICAgICBpdGVtLmVycm9yICYmIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZm9udFNpemU6IDEwLCBjb2xvcjogJyNlZjQ0NDQnLCBtYXJnaW5Ub3A6IDIgfSB9LCBpdGVtLmVycm9yKSksXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTAsIGNvbG9yOiBzdGF0ZUNvbG9yW2l0ZW0uc3RhdGVdLCBmbGV4U2hyaW5rOiAwIH0gfSwgaXRlbS5zdGF0ZSA9PT0gJ3VwbG9hZGluZycgPyBgJHtpdGVtLnByb2dyZXNzfSVgIDogaXRlbS5zdGF0ZSkpKSkpKSkpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGhvdG8tdXBsb2FkZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcbiAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19zZXRNb2R1bGVEZWZhdWx0KSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xufSkgOiBmdW5jdGlvbihvLCB2KSB7XG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xufSk7XG52YXIgX19pbXBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydFN0YXIpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG93bktleXMgPSBmdW5jdGlvbihvKSB7XG4gICAgICAgIG93bktleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgdmFyIGFyID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBrIGluIG8pIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobywgaykpIGFyW2FyLmxlbmd0aF0gPSBrO1xuICAgICAgICAgICAgcmV0dXJuIGFyO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gb3duS2V5cyhvKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAobW9kKSB7XG4gICAgICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrID0gb3duS2V5cyhtb2QpLCBpID0gMDsgaSA8IGsubGVuZ3RoOyBpKyspIGlmIChrW2ldICE9PSBcImRlZmF1bHRcIikgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrW2ldKTtcbiAgICAgICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xufSkoKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHJlYWN0XzEgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcInJlYWN0XCIpKTtcbmNvbnN0IGFkbWluanNfMSA9IHJlcXVpcmUoXCJhZG1pbmpzXCIpO1xuY29uc3QgSU5JVElBTCA9IHtcbiAgICBwdWJsaXNoZWRQb3N0czogJ+KAkycsXG4gICAgZHJhZnRQb3N0czogJ+KAkycsXG4gICAgcHJvamVjdHM6ICfigJMnLFxuICAgIHBob3RvczogJ+KAkycsXG4gICAgYWxidW1zOiAn4oCTJyxcbn07XG5jb25zdCBDQVJEUyA9IFtcbiAgICB7IGtleTogJ3B1Ymxpc2hlZFBvc3RzJywgbGFiZWw6ICdQdWJsaXNoZWQgUG9zdHMnLCBpY29uOiAn8J+TnScsIGFjY2VudDogJyM2MzY2ZjEnIH0sXG4gICAgeyBrZXk6ICdkcmFmdFBvc3RzJywgbGFiZWw6ICdEcmFmdCBQb3N0cycsIGljb246ICfinI/vuI8nLCBhY2NlbnQ6ICcjZjU5ZTBiJyB9LFxuICAgIHsga2V5OiAncHJvamVjdHMnLCBsYWJlbDogJ1Byb2plY3RzJywgaWNvbjogJ/CfmoAnLCBhY2NlbnQ6ICcjMjJjNTVlJyB9LFxuICAgIHsga2V5OiAncGhvdG9zJywgbGFiZWw6ICdQaG90b3MnLCBpY29uOiAn8J+TtycsIGFjY2VudDogJyMzYjgyZjYnIH0sXG4gICAgeyBrZXk6ICdhbGJ1bXMnLCBsYWJlbDogJ0FsYnVtcycsIGljb246ICfwn5eC77iPJywgYWNjZW50OiAnI2E4NTVmNycgfSxcbl07XG5jb25zdCBEYXNoYm9hcmQgPSAoKSA9PiB7XG4gICAgY29uc3QgW3N0YXRzLCBzZXRTdGF0c10gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoSU5JVElBTCk7XG4gICAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKHRydWUpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKG51bGwpO1xuICAgICgwLCByZWFjdF8xLnVzZUVmZmVjdCkoKCkgPT4ge1xuICAgICAgICBjb25zdCBhcGkgPSBuZXcgYWRtaW5qc18xLkFwaUNsaWVudCgpO1xuICAgICAgICBhc3luYyBmdW5jdGlvbiBsb2FkKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBbcHViUG9zdHNSZXMsIGFsbFBvc3RzUmVzLCBwcm9qZWN0c1JlcywgcGhvdG9zUmVzLCBhbGJ1bXNSZXNdID0gYXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKFtcbiAgICAgICAgICAgICAgICAgICAgZmV0Y2goJy92MS9ibG9nJywgeyBjcmVkZW50aWFsczogJ2luY2x1ZGUnIH0pLnRoZW4ociA9PiByLmpzb24oKSksXG4gICAgICAgICAgICAgICAgICAgIGFwaS5yZXNvdXJjZUFjdGlvbih7IHJlc291cmNlSWQ6ICdCbG9nUG9zdCcsIGFjdGlvbk5hbWU6ICdsaXN0JywgcGFyYW1zOiB7IHBlclBhZ2U6IDEgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgZmV0Y2goJy92MS9wcm9qZWN0cycsIHsgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyB9KS50aGVuKHIgPT4gci5qc29uKCkpLFxuICAgICAgICAgICAgICAgICAgICBmZXRjaCgnL3YxL2dhbGxlcnkvcGhvdG9zJywgeyBjcmVkZW50aWFsczogJ2luY2x1ZGUnIH0pLnRoZW4ociA9PiByLmpzb24oKSksXG4gICAgICAgICAgICAgICAgICAgIGZldGNoKCcvdjEvZ2FsbGVyeS9hbGJ1bXMnLCB7IGNyZWRlbnRpYWxzOiAnaW5jbHVkZScgfSkudGhlbihyID0+IHIuanNvbigpKSxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwdWJsaXNoZWRQb3N0cyA9IHB1YlBvc3RzUmVzLnN0YXR1cyA9PT0gJ2Z1bGZpbGxlZCcgPyBwdWJQb3N0c1Jlcy52YWx1ZS5sZW5ndGggOiAn4oCTJztcbiAgICAgICAgICAgICAgICBjb25zdCB0b3RhbFBvc3RzID0gYWxsUG9zdHNSZXMuc3RhdHVzID09PSAnZnVsZmlsbGVkJ1xuICAgICAgICAgICAgICAgICAgICA/IChhbGxQb3N0c1Jlcy52YWx1ZT8uZGF0YT8ubWV0YT8udG90YWwgPz8gJ+KAkycpXG4gICAgICAgICAgICAgICAgICAgIDogJ+KAkyc7XG4gICAgICAgICAgICAgICAgY29uc3QgZHJhZnRQb3N0cyA9IHR5cGVvZiB0b3RhbFBvc3RzID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgcHVibGlzaGVkUG9zdHMgPT09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgID8gdG90YWxQb3N0cyAtIHB1Ymxpc2hlZFBvc3RzXG4gICAgICAgICAgICAgICAgICAgIDogJ+KAkyc7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvamVjdHMgPSBwcm9qZWN0c1Jlcy5zdGF0dXMgPT09ICdmdWxmaWxsZWQnID8gcHJvamVjdHNSZXMudmFsdWUubGVuZ3RoIDogJ+KAkyc7XG4gICAgICAgICAgICAgICAgY29uc3QgcGhvdG9zID0gcGhvdG9zUmVzLnN0YXR1cyA9PT0gJ2Z1bGZpbGxlZCdcbiAgICAgICAgICAgICAgICAgICAgPyAocGhvdG9zUmVzLnZhbHVlPy50b3RhbCA/PyAn4oCTJylcbiAgICAgICAgICAgICAgICAgICAgOiAn4oCTJztcbiAgICAgICAgICAgICAgICBjb25zdCBhbGJ1bXMgPSBhbGJ1bXNSZXMuc3RhdHVzID09PSAnZnVsZmlsbGVkJyA/IGFsYnVtc1Jlcy52YWx1ZS5sZW5ndGggOiAn4oCTJztcbiAgICAgICAgICAgICAgICBzZXRTdGF0cyh7IHB1Ymxpc2hlZFBvc3RzLCBkcmFmdFBvc3RzLCBwcm9qZWN0cywgcGhvdG9zLCBhbGJ1bXMgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHNldEVycm9yKGU/Lm1lc3NhZ2UgPz8gJ0ZhaWxlZCB0byBsb2FkIHN0YXRzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2b2lkIGxvYWQoKTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3QgaG91ciA9IG5ldyBEYXRlKCkuZ2V0SG91cnMoKTtcbiAgICBjb25zdCBncmVldGluZyA9IGhvdXIgPCAxMiA/ICdHb29kIG1vcm5pbmcnIDogaG91ciA8IDE4ID8gJ0dvb2QgYWZ0ZXJub29uJyA6ICdHb29kIGV2ZW5pbmcnO1xuICAgIHJldHVybiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBwYWRkaW5nOiAnMzJweCcsIGZvbnRGYW1pbHk6ICdzeXN0ZW0tdWksIHNhbnMtc2VyaWYnIH0gfSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBtYXJnaW5Cb3R0b206ICczMnB4JyB9IH0sXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImgxXCIsIHsgc3R5bGU6IHsgZm9udFNpemU6ICcyOHB4JywgZm9udFdlaWdodDogNzAwLCBtYXJnaW46IDAsIGNvbG9yOiAnI2UyZThmMCcgfSB9LFxuICAgICAgICAgICAgICAgIGdyZWV0aW5nLFxuICAgICAgICAgICAgICAgIFwiIFxcdUQ4M0RcXHVEQzRCXCIpLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJwXCIsIHsgc3R5bGU6IHsgY29sb3I6ICcjOTRhM2I4JywgbWFyZ2luVG9wOiAnNnB4JywgZm9udFNpemU6ICcxNXB4JyB9IH0sIFwiSGVyZSdzIGEgbGl2ZSBzbmFwc2hvdCBvZiB5b3VyIHBvcnRmb2xpbyBjb250ZW50LlwiKSksXG4gICAgICAgIGVycm9yICYmIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IHBhZGRpbmc6ICcxMnB4IDE2cHgnLCBiYWNrZ3JvdW5kOiAncmdiYSgyMzksNjgsNjgsMC4xNSknLCBib3JkZXI6ICcxcHggc29saWQgcmdiYSgyMzksNjgsNjgsMC40KScsIGJvcmRlclJhZGl1czogJzhweCcsIGNvbG9yOiAnI2ZjYTVhNScsIG1hcmdpbkJvdHRvbTogJzI0cHgnLCBmb250U2l6ZTogJzE0cHgnIH0gfSxcbiAgICAgICAgICAgIFwiXFx1MjZBMFxcdUZFMEYgXCIsXG4gICAgICAgICAgICBlcnJvcikpLFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpbGwsIG1pbm1heCgyMDBweCwgMWZyKSknLCBnYXA6ICcyMHB4JyB9IH0sIENBUkRTLm1hcCgoeyBrZXksIGxhYmVsLCBpY29uLCBhY2NlbnQgfSkgPT4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsga2V5OiBrZXksIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ3JnYmEoMzAsNDEsNTksMC44KScsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiBgMXB4IHNvbGlkICR7YWNjZW50fTQwYCxcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjRweCcsXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiBgMCAwIDAgMXB4ICR7YWNjZW50fTIwLCAwIDRweCAyNHB4IHJnYmEoMCwwLDAsMC4zKWAsXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ3RyYW5zZm9ybSAxNTBtcycsXG4gICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAnMjhweCcsIG1hcmdpbkJvdHRvbTogJzEycHgnLCBsaW5lSGVpZ2h0OiAxIH0gfSwgaWNvbiksXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMzZweCcsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IDcwMCxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGxvYWRpbmcgPyAnIzRiNTU2MycgOiBhY2NlbnQsXG4gICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6IDEsXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzZweCcsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdjb2xvciAzMDBtcycsXG4gICAgICAgICAgICAgICAgfSB9LCBsb2FkaW5nID8gJ+KAlCcgOiBTdHJpbmcoc3RhdHNba2V5XSkpLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBjb2xvcjogJyM5NGEzYjgnLCBmb250U2l6ZTogJzEzcHgnLCBmb250V2VpZ2h0OiA1MDAsIGxldHRlclNwYWNpbmc6ICcwLjAyNWVtJyB9IH0sIGxhYmVsKSkpKSksXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgbWFyZ2luVG9wOiAnNDBweCcgfSB9LFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJoMlwiLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAnMTZweCcsIGZvbnRXZWlnaHQ6IDYwMCwgY29sb3I6ICcjY2JkNWUxJywgbWFyZ2luQm90dG9tOiAnMTZweCcgfSB9LCBcIlF1aWNrIGFjdGlvbnNcIiksXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnMTJweCcsIGZsZXhXcmFwOiAnd3JhcCcgfSB9LCBbXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJysgTmV3IEJsb2cgUG9zdCcsIGhyZWY6ICcvYWRtaW4vcmVzb3VyY2VzL0Jsb2dQb3N0L2FjdGlvbnMvbmV3JywgY29sb3I6ICcjNjM2NmYxJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICcrIE5ldyBQcm9qZWN0JywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvUHJvamVjdC9hY3Rpb25zL25ldycsIGNvbG9yOiAnIzIyYzU1ZScgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnKyBOZXcgQWxidW0nLCBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9BbGJ1bS9hY3Rpb25zL25ldycsIGNvbG9yOiAnI2E4NTVmNycgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnKyBVcGxvYWQgUGhvdG9zJywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvUGhvdG8vYWN0aW9ucy9uZXcnLCBjb2xvcjogJyMzYjgyZjYnIH0sXG4gICAgICAgICAgICBdLm1hcCgoeyBsYWJlbCwgaHJlZiwgY29sb3IgfSkgPT4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiYVwiLCB7IGtleTogaHJlZiwgaHJlZjogaHJlZiwgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc5cHggMThweCcsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IGAke2NvbG9yfTIwYCxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiBgMXB4IHNvbGlkICR7Y29sb3J9NjBgLFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc4cHgnLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcixcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxM3B4JyxcbiAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogNjAwLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0RGVjb3JhdGlvbjogJ25vbmUnLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnYmFja2dyb3VuZCAxNTBtcycsXG4gICAgICAgICAgICAgICAgfSB9LCBsYWJlbCkpKSkpLFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInBcIiwgeyBzdHlsZTogeyBjb2xvcjogJyM0NzU1NjknLCBmb250U2l6ZTogJzEycHgnLCBtYXJnaW5Ub3A6ICczMnB4JyB9IH0sXG4gICAgICAgICAgICBcIlN0YXRzIGxvYWRlZCBhdCBcIixcbiAgICAgICAgICAgIG5ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCkpKSk7XG59O1xuZXhwb3J0cy5kZWZhdWx0ID0gRGFzaGJvYXJkO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGFzaGJvYXJkLmpzLm1hcCIsIkFkbWluSlMuVXNlckNvbXBvbmVudHMgPSB7fVxuaW1wb3J0IE1hcmtkb3duRWRpdG9yIGZyb20gJy4uL2Rpc3QvYWRtaW4vY29tcG9uZW50cy9tYXJrZG93bi1lZGl0b3InXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLk1hcmtkb3duRWRpdG9yID0gTWFya2Rvd25FZGl0b3JcbmltcG9ydCBUYWdQaWNrZXIgZnJvbSAnLi4vZGlzdC9hZG1pbi9jb21wb25lbnRzL3RhZy1waWNrZXInXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlRhZ1BpY2tlciA9IFRhZ1BpY2tlclxuaW1wb3J0IFNraWxsUGlja2VyIGZyb20gJy4uL2Rpc3QvYWRtaW4vY29tcG9uZW50cy9za2lsbC1waWNrZXInXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlNraWxsUGlja2VyID0gU2tpbGxQaWNrZXJcbmltcG9ydCBNZWRpYVVwbG9hZGVyIGZyb20gJy4uL2Rpc3QvYWRtaW4vY29tcG9uZW50cy9tZWRpYS11cGxvYWRlcidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuTWVkaWFVcGxvYWRlciA9IE1lZGlhVXBsb2FkZXJcbmltcG9ydCBWaWRlb01hbmFnZXIgZnJvbSAnLi4vZGlzdC9hZG1pbi9jb21wb25lbnRzL3ZpZGVvLW1hbmFnZXInXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlZpZGVvTWFuYWdlciA9IFZpZGVvTWFuYWdlclxuaW1wb3J0IFBob3RvVXBsb2FkZXIgZnJvbSAnLi4vZGlzdC9hZG1pbi9jb21wb25lbnRzL3Bob3RvLXVwbG9hZGVyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5QaG90b1VwbG9hZGVyID0gUGhvdG9VcGxvYWRlclxuaW1wb3J0IERhc2hib2FyZCBmcm9tICcuLi9kaXN0L2FkbWluL2NvbXBvbmVudHMvZGFzaGJvYXJkJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5EYXNoYm9hcmQgPSBEYXNoYm9hcmQiXSwibmFtZXMiOlsicmVzdWx0IiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJtYXJrZG93bkVkaXRvciIsInZhbHVlIiwicmVhY3RfMSIsIl9faW1wb3J0U3RhciIsInJlcXVpcmUkJDAiLCJlc2MiLCJzIiwicmVwbGFjZSIsInJlbmRlck1hcmtkb3duIiwicmF3Iiwic2F2ZWQiLCJfIiwibGFuZyIsImNvZGUiLCJwdXNoIiwidHJpbSIsImxlbmd0aCIsImMiLCJsaW5lcyIsInNwbGl0Iiwib3V0IiwibGlzdFR5cGUiLCJmbHVzaExpc3QiLCJsaXN0QnVmIiwiam9pbiIsImxpbmUiLCJoIiwibWF0Y2giLCJicSIsInRlc3QiLCJ1bG0iLCJvbG0iLCJ0eXBlIiwic2VjdGlvbnMiLCJtYXAiLCJzZWMiLCJ0Iiwic3RhcnRzV2l0aCIsImZvckVhY2giLCJibGsiLCJpIiwiTWFya2Rvd25FZGl0b3IiLCJwcm9wZXJ0eSIsInJlY29yZCIsIm9uQ2hhbmdlIiwiZmllbGRQYXRoIiwicGF0aCIsImluaXRpYWxWYWx1ZSIsInBhcmFtcyIsInNldFZhbHVlIiwidXNlU3RhdGUiLCJwcmV2aWV3Iiwic2V0UHJldmlldyIsInVwbG9hZGluZyIsInNldFVwbG9hZGluZyIsImFjdGl2ZVRhYiIsInNldEFjdGl2ZVRhYiIsInRleHRhcmVhUmVmIiwidXNlUmVmIiwiZmlsZUlucHV0UmVmIiwiZGVib3VuY2VSZWYiLCJ1c2VFZmZlY3QiLCJ2IiwiaWQiLCJoYW5kbGVDaGFuZ2UiLCJ1c2VDYWxsYmFjayIsImUiLCJ0YXJnZXQiLCJjdXJyZW50IiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsImluc2VydEF0Q3Vyc29yIiwidGV4dCIsInRhIiwic3RhcnQiLCJzZWxlY3Rpb25TdGFydCIsImVuZCIsIm5leHQiLCJzbGljZSIsInNlbGVjdGlvbkVuZCIsImhhbmRsZVVwbG9hZCIsImZpbGUiLCJmZCIsIkZvcm1EYXRhIiwiYXBwZW5kIiwicmVzIiwiZmV0Y2giLCJtZXRob2QiLCJib2R5IiwiY3JlZGVudGlhbHMiLCJvayIsInVybCIsImpzb24iLCJuYW1lIiwiZXJyIiwiYWxlcnQiLCJtZXNzYWdlIiwiZWRpdG9yU3R5bGUiLCJmbGV4IiwiZm9udEZhbWlseSIsImZvbnRTaXplIiwibGluZUhlaWdodCIsInBhZGRpbmciLCJib3JkZXIiLCJib3JkZXJSYWRpdXMiLCJyZXNpemUiLCJiYWNrZ3JvdW5kIiwiY29sb3IiLCJtaW5IZWlnaHQiLCJib3hTaXppbmciLCJvdmVyZmxvd1kiLCJwcmV2aWV3U3R5bGUiLCJ0YWJCdG4iLCJhY3RpdmUiLCJmb250V2VpZ2h0IiwiY3Vyc29yIiwiZGVmYXVsdCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsImRpc3BsYXkiLCJmbGV4RGlyZWN0aW9uIiwiZ2FwIiwiYWxpZ25JdGVtcyIsImZsZXhXcmFwIiwia2V5Iiwib25DbGljayIsImxhYmVsIiwidGl0bGUiLCJpbnNlcnQiLCJfX3NldE1vZHVsZURlZmF1bHQiLCJtb2QiLCJ0YWdQaWNrZXIiLCJ0aGlzIiwiYWRtaW5qc18xIiwicmVxdWlyZSQkMSIsImFwaSIsIkFwaUNsaWVudCIsIlRhZ1BpY2tlciIsImFsbFRhZ3MiLCJzZXRBbGxUYWdzIiwic2VsZWN0ZWQiLCJzZXRTZWxlY3RlZCIsInNldFF1ZXJ5Iiwic2V0U2hvd0Ryb3Bkb3duIiwidGhlbiIsInIiLCJ0YWdzIiwiY2F0Y2giLCJmcm9tUGFyYW1zIiwicG9wdWxhdGVkIiwiZnJvbVBvcHVsYXRlZCIsImZpbHRlciIsInNlZW4iLCJtZXJnZWQiLCJoYXMiLCJhZGQiLCJhZGRUYWciLCJ0YWciLCJzb21lIiwiZW1pdCIsInJlbW92ZVRhZyIsImNyZWF0ZVRhZyIsInF1ZXJ5IiwidG9Mb3dlckNhc2UiLCJleGlzdGluZyIsImZpbmQiLCJyZXNvdXJjZUlkIiwiYWN0aW9uTmFtZSIsImRhdGEiLCJjcmVhdGVkIiwicHJldiIsInNvcnQiLCJhIiwiYiIsImxvY2FsZUNvbXBhcmUiLCJmaWx0ZXJlZCIsImluY2x1ZGVzIiwiY2hpcCIsImJhY2tncm91bmRDb2xvciIsInJlbW92ZUJ0biIsInBvc2l0aW9uIiwiX2RlZmF1bHQiLCJza2lsbFBpY2tlciIsIlNraWxsUGlja2VyIiwic2tpbGxzIiwic2V0U2tpbGxzIiwiaWRzIiwiZW50cmllcyIsInZhbCIsImVuZHNXaXRoIiwiQm9vbGVhbiIsImJhc2UiLCJ3aW5kb3ciLCJfX0FQSV9CQVNFX18iLCJsb2NhdGlvbiIsInByb3RvY29sIiwiaG9zdG5hbWUiLCJmaW5hbGx5Iiwic2V0TG9hZGluZyIsIngiLCJTZXQiLCJjYXRlZ29yeSIsInRleHRUcmFuc2Zvcm0iLCJsZXR0ZXJTcGFjaW5nIiwib3BhY2l0eSIsInNrIiwidG9nZ2xlIiwibWVkaWFVcGxvYWRlciIsIk1lZGlhVXBsb2FkZXIiLCJhcGlCYXNlIiwidW5kZWZpbmVkIiwiYWx0VGV4dCIsIml0ZW1zIiwic2V0SXRlbXMiLCJpbml0aWFsIiwiZHJhZ2dpbmciLCJzZXREcmFnZ2luZyIsImRyYWdJZHgiLCJmaWxlUmVmIiwibSIsImVycm9yIiwiZmlsZXMiLCJwbGFjZWhvbGRlcnMiLCJBcnJheSIsImZyb20iLCJmIiwiVVJMIiwiY3JlYXRlT2JqZWN0VVJMIiwiRXJyb3IiLCJzdGF0dXMiLCJpZHgiLCJmaW5kSW5kZXgiLCJvbkRyYWdPdmVyIiwibW92ZWQiLCJzcGxpY2UiLCJvbkRyb3Bab25lIiwicHJldmVudERlZmF1bHQiLCJkYXRhVHJhbnNmZXIiLCJ0ZXh0QWxpZ24iLCJ0cmFuc2l0aW9uIiwidmlkZW9NYW5hZ2VyIiwiVmlkZW9NYW5hZ2VyIiwiZGV0ZWN0U291cmNlIiwic291cmNlIiwibmV3VXJsIiwic2V0TmV3VXJsIiwibmV3VGl0bGUiLCJhZGRJdGVtIiwiaXRlbSIsInNldE5ld1RpdGxlIiwibGFiZWxTdHlsZSIsIm1hcmdpbkJvdHRvbSIsImlucHV0U3R5bGUiLCJ3aWR0aCIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwicGxhY2Vob2xkZXIiLCJvbktleURvd24iLCJhbGlnblNlbGYiLCJkcmFnZ2FibGUiLCJvbkRyYWdTdGFydCIsInBob3RvVXBsb2FkZXIiLCJQaG90b1VwbG9hZGVyIiwiZXhpc3RpbmdVcmwiLCJ1cGRhdGUiLCJwYXRjaCIsIml0IiwidXBsb2FkT25lIiwic3RhdGUiLCJwcm9ncmVzcyIsIlhNTEh0dHBSZXF1ZXN0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ4aHIiLCJ1cGxvYWQiLCJhZGRFdmVudExpc3RlbmVyIiwibGVuZ3RoQ29tcHV0YWJsZSIsImxvYWRlZCIsInRvdGFsIiwiSlNPTiIsInBhcnNlIiwicmVzcG9uc2VUZXh0IiwicmVzdWx0VXJsIiwib3JpZ2luYWxVcmwiLCJvcGVuIiwid2l0aENyZWRlbnRpYWxzIiwic2VuZCIsImFkZEZpbGVzIiwiZmlsZUxpc3QiLCJhbGxvd2VkIiwiTWF0aCIsIm1pbiIsIm5ld0l0ZW1zIiwibG9jYWxVcmwiLCJzdGF0ZUNvbG9yIiwicGVuZGluZyIsImRvbmUiLCJzcmMiLCJhbHQiLCJoZWlnaHQiLCJvYmplY3RGaXQiLCJvbkRyYWdMZWF2ZSIsIm9uRHJvcCIsImNsaWNrIiwiZGFzaGJvYXJkIiwiSU5JVElBTCIsInB1Ymxpc2hlZFBvc3RzIiwiZHJhZnRQb3N0cyIsInByb2plY3RzIiwicGhvdG9zIiwiYWxidW1zIiwiQ0FSRFMiLCJpY29uIiwiYWNjZW50IiwiRGFzaGJvYXJkIiwic3RhdHMiLCJzZXRTdGF0cyIsInNldEVycm9yIiwibG9hZCIsImFsbFBvc3RzUmVzIiwicGhvdG9zUmVzIiwiYWxidW1zUmVzIiwiYWxsU2V0dGxlZCIsInJlc291cmNlQWN0aW9uIiwicGVyUGFnZSIsInB1YlBvc3RzUmVzIiwidG90YWxQb3N0cyIsIm1ldGEiLCJwcm9qZWN0c1JlcyIsIkRhdGUiLCJnZXRIb3VycyIsImhvdXIiLCJncmVldGluZyIsIm1hcmdpblRvcCIsImdyaWRUZW1wbGF0ZUNvbHVtbnMiLCJsb2FkaW5nIiwiQWRtaW5KUyIsIlVzZXJDb21wb25lbnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7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
