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
	    const populated = record?.populated?.[property.path] ?? [];
	    const current = populated.map(r => ({
	      id: r.params?.id,
	      name: r.params?.name
	    })).filter(t => t.id && t.name);
	    setSelected(current);
	  }, [record?.id]);
	  const emit = tags => {
	    onChange(property.path, tags.map(t => t.id));
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
	      onChange(property.path, next);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9kaXN0L3NyYy9hZG1pbi9jb21wb25lbnRzL21hcmtkb3duLWVkaXRvci5qcyIsIi4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvdGFnLXBpY2tlci5qcyIsIi4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvc2tpbGwtcGlja2VyLmpzIiwiLi4vZGlzdC9zcmMvYWRtaW4vY29tcG9uZW50cy9tZWRpYS11cGxvYWRlci5qcyIsIi4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvdmlkZW8tbWFuYWdlci5qcyIsIi4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvcGhvdG8tdXBsb2FkZXIuanMiLCIuLi9kaXN0L3NyYy9hZG1pbi9jb21wb25lbnRzL2Rhc2hib2FyZC5qcyIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBvd25LZXlzID0gZnVuY3Rpb24obykge1xuICAgICAgICBvd25LZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgIHZhciBhciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBvKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspKSBhclthci5sZW5ndGhdID0gaztcbiAgICAgICAgICAgIHJldHVybiBhcjtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG93bktleXMobyk7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1vZCkge1xuICAgICAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayA9IG93bktleXMobW9kKSwgaSA9IDA7IGkgPCBrLmxlbmd0aDsgaSsrKSBpZiAoa1tpXSAhPT0gXCJkZWZhdWx0XCIpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwga1tpXSk7XG4gICAgICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCByZWFjdF8xID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5mdW5jdGlvbiBlc2Mocykge1xuICAgIHJldHVybiBzLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKTtcbn1cbmZ1bmN0aW9uIHJlbmRlck1hcmtkb3duKHJhdykge1xuICAgIGNvbnN0IHNhdmVkID0gW107XG4gICAgbGV0IHMgPSByYXcucmVwbGFjZSgvYGBgKFxcdyopXFxuPyhbXFxzXFxTXSo/KWBgYC9nLCAoXywgbGFuZywgY29kZSkgPT4ge1xuICAgICAgICBzYXZlZC5wdXNoKGA8cHJlIHN0eWxlPVwiYmFja2dyb3VuZDojMGQxMTE3O3BhZGRpbmc6MTJweDtib3JkZXItcmFkaXVzOjZweDtvdmVyZmxvdzphdXRvXCI+PGNvZGU+JHtlc2MoY29kZS50cmltKCkpfTwvY29kZT48L3ByZT5gKTtcbiAgICAgICAgcmV0dXJuIGBcXHgwMENCJHtzYXZlZC5sZW5ndGggLSAxfVxceDAwYDtcbiAgICB9KTtcbiAgICBzID0gcy5yZXBsYWNlKC9gKFteYFxcbl0rKWAvZywgKF8sIGMpID0+IGA8Y29kZSBzdHlsZT1cImJhY2tncm91bmQ6IzFlMjkzYjtwYWRkaW5nOjJweCA2cHg7Ym9yZGVyLXJhZGl1czo0cHg7Zm9udC1zaXplOjAuOWVtXCI+JHtlc2MoYyl9PC9jb2RlPmApO1xuICAgIGNvbnN0IGxpbmVzID0gcy5zcGxpdCgnXFxuJyk7XG4gICAgY29uc3Qgb3V0ID0gW107XG4gICAgbGV0IGxpc3RCdWYgPSBbXTtcbiAgICBsZXQgbGlzdFR5cGUgPSAndWwnO1xuICAgIGNvbnN0IGZsdXNoTGlzdCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCFsaXN0QnVmLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgb3V0LnB1c2goYDwke2xpc3RUeXBlfSBzdHlsZT1cInBhZGRpbmctbGVmdDoxLjVlbTttYXJnaW46MC41ZW0gMFwiPiR7bGlzdEJ1Zi5qb2luKCcnKX08LyR7bGlzdFR5cGV9PmApO1xuICAgICAgICBsaXN0QnVmID0gW107XG4gICAgfTtcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgY29uc3QgaCA9IGxpbmUubWF0Y2goL14oI3sxLDZ9KVxccysoLispLyk7XG4gICAgICAgIGlmIChoKSB7XG4gICAgICAgICAgICBmbHVzaExpc3QoKTtcbiAgICAgICAgICAgIG91dC5wdXNoKGA8aCR7aFsxXS5sZW5ndGh9IHN0eWxlPVwibWFyZ2luOjAuNzVlbSAwIDAuMjVlbVwiPiR7aFsyXX08L2gke2hbMV0ubGVuZ3RofT5gKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJxID0gbGluZS5tYXRjaCgvXj5cXHMqKC4qKS8pO1xuICAgICAgICBpZiAoYnEpIHtcbiAgICAgICAgICAgIGZsdXNoTGlzdCgpO1xuICAgICAgICAgICAgb3V0LnB1c2goYDxibG9ja3F1b3RlIHN0eWxlPVwiYm9yZGVyLWxlZnQ6M3B4IHNvbGlkICM2MzY2ZjE7bWFyZ2luOjAuNWVtIDA7cGFkZGluZzo0cHggMTJweDtjb2xvcjojOTRhM2I4XCI+JHticVsxXX08L2Jsb2NrcXVvdGU+YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoL15bLSpfXXszLH0kLy50ZXN0KGxpbmUudHJpbSgpKSkge1xuICAgICAgICAgICAgZmx1c2hMaXN0KCk7XG4gICAgICAgICAgICBvdXQucHVzaCgnPGhyIHN0eWxlPVwiYm9yZGVyOm5vbmU7Ym9yZGVyLXRvcDoxcHggc29saWQgIzMzNDE1NTttYXJnaW46MWVtIDBcIj4nKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVsbSA9IGxpbmUubWF0Y2goL14oXFxzKilbLSorXVxccysoLiopLyk7XG4gICAgICAgIGNvbnN0IG9sbSA9IGxpbmUubWF0Y2goL14oXFxzKilcXGQrXFwuXFxzKyguKikvKTtcbiAgICAgICAgaWYgKHVsbSB8fCBvbG0pIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSB1bG0gPyAndWwnIDogJ29sJztcbiAgICAgICAgICAgIGlmIChsaXN0QnVmLmxlbmd0aCAmJiB0eXBlICE9PSBsaXN0VHlwZSlcbiAgICAgICAgICAgICAgICBmbHVzaExpc3QoKTtcbiAgICAgICAgICAgIGxpc3RUeXBlID0gdHlwZTtcbiAgICAgICAgICAgIGxpc3RCdWYucHVzaChgPGxpPiR7KHVsbSA/PyBvbG0pWzJdfTwvbGk+YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBmbHVzaExpc3QoKTtcbiAgICAgICAgb3V0LnB1c2gobGluZSk7XG4gICAgfVxuICAgIGZsdXNoTGlzdCgpO1xuICAgIHMgPSBvdXQuam9pbignXFxuJyk7XG4gICAgcyA9IHMucmVwbGFjZSgvXFwqXFwqXFwqKC4rPylcXCpcXCpcXCovZywgJzxzdHJvbmc+PGVtPiQxPC9lbT48L3N0cm9uZz4nKTtcbiAgICBzID0gcy5yZXBsYWNlKC9cXCpcXCooLis/KVxcKlxcKi9nLCAnPHN0cm9uZz4kMTwvc3Ryb25nPicpO1xuICAgIHMgPSBzLnJlcGxhY2UoL1xcKiguKz8pXFwqL2csICc8ZW0+JDE8L2VtPicpO1xuICAgIHMgPSBzLnJlcGxhY2UoL35+KC4rPyl+fi9nLCAnPGRlbD4kMTwvZGVsPicpO1xuICAgIHMgPSBzLnJlcGxhY2UoLyFcXFsoW15cXF1dKilcXF1cXCgoW14pXSspXFwpL2csICc8aW1nIHNyYz1cIiQyXCIgYWx0PVwiJDFcIiBzdHlsZT1cIm1heC13aWR0aDoxMDAlO2JvcmRlci1yYWRpdXM6NnB4O21hcmdpbjowLjVlbSAwXCI+Jyk7XG4gICAgcyA9IHMucmVwbGFjZSgvXFxbKFteXFxdXSspXFxdXFwoKFteKV0rKVxcKS9nLCAnPGEgaHJlZj1cIiQyXCIgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9vcGVuZXJcIiBzdHlsZT1cImNvbG9yOiM2MzY2ZjFcIj4kMTwvYT4nKTtcbiAgICBjb25zdCBzZWN0aW9ucyA9IHMuc3BsaXQoL1xcblxcbisvKTtcbiAgICBzID0gc2VjdGlvbnMubWFwKHNlYyA9PiB7XG4gICAgICAgIGNvbnN0IHQgPSBzZWMudHJpbSgpO1xuICAgICAgICBpZiAoIXQpXG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIGlmICgvXjwoaFsxLTZdfHVsfG9sfHByZXxibG9ja3F1b3RlfGhyfGltZykvLnRlc3QodCkgfHwgdC5zdGFydHNXaXRoKCdcXHgwMENCJykpXG4gICAgICAgICAgICByZXR1cm4gdDtcbiAgICAgICAgcmV0dXJuIGA8cCBzdHlsZT1cIm1hcmdpbjowLjVlbSAwO2xpbmUtaGVpZ2h0OjEuN1wiPiR7dC5yZXBsYWNlKC9cXG4vZywgJzxicj4nKX08L3A+YDtcbiAgICB9KS5qb2luKCdcXG4nKTtcbiAgICBzYXZlZC5mb3JFYWNoKChibGssIGkpID0+IHsgcyA9IHMucmVwbGFjZShgXFx4MDBDQiR7aX1cXHgwMGAsIGJsayk7IH0pO1xuICAgIHJldHVybiBzO1xufVxuY29uc3QgTWFya2Rvd25FZGl0b3IgPSAoeyBwcm9wZXJ0eSwgcmVjb3JkLCBvbkNoYW5nZSB9KSA9PiB7XG4gICAgY29uc3QgZmllbGRQYXRoID0gcHJvcGVydHkucGF0aDtcbiAgICBjb25zdCBpbml0aWFsVmFsdWUgPSByZWNvcmQ/LnBhcmFtcz8uW2ZpZWxkUGF0aF0gPz8gJyc7XG4gICAgY29uc3QgW3ZhbHVlLCBzZXRWYWx1ZV0gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoaW5pdGlhbFZhbHVlKTtcbiAgICBjb25zdCBbcHJldmlldywgc2V0UHJldmlld10gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoKCkgPT4gcmVuZGVyTWFya2Rvd24oaW5pdGlhbFZhbHVlKSk7XG4gICAgY29uc3QgW3VwbG9hZGluZywgc2V0VXBsb2FkaW5nXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShmYWxzZSk7XG4gICAgY29uc3QgW2FjdGl2ZVRhYiwgc2V0QWN0aXZlVGFiXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKSgnc3BsaXQnKTtcbiAgICBjb25zdCB0ZXh0YXJlYVJlZiA9ICgwLCByZWFjdF8xLnVzZVJlZikobnVsbCk7XG4gICAgY29uc3QgZmlsZUlucHV0UmVmID0gKDAsIHJlYWN0XzEudXNlUmVmKShudWxsKTtcbiAgICBjb25zdCBkZWJvdW5jZVJlZiA9ICgwLCByZWFjdF8xLnVzZVJlZikobnVsbCk7XG4gICAgKDAsIHJlYWN0XzEudXNlRWZmZWN0KSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHYgPSByZWNvcmQ/LnBhcmFtcz8uW2ZpZWxkUGF0aF0gPz8gJyc7XG4gICAgICAgIHNldFZhbHVlKHYpO1xuICAgICAgICBzZXRQcmV2aWV3KHJlbmRlck1hcmtkb3duKHYpKTtcbiAgICB9LCBbcmVjb3JkPy5pZF0pO1xuICAgIGNvbnN0IGhhbmRsZUNoYW5nZSA9ICgwLCByZWFjdF8xLnVzZUNhbGxiYWNrKSgoZSkgPT4ge1xuICAgICAgICBjb25zdCB2ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHNldFZhbHVlKHYpO1xuICAgICAgICBvbkNoYW5nZShmaWVsZFBhdGgsIHYpO1xuICAgICAgICBpZiAoZGVib3VuY2VSZWYuY3VycmVudClcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChkZWJvdW5jZVJlZi5jdXJyZW50KTtcbiAgICAgICAgZGVib3VuY2VSZWYuY3VycmVudCA9IHNldFRpbWVvdXQoKCkgPT4gc2V0UHJldmlldyhyZW5kZXJNYXJrZG93bih2KSksIDMwMCk7XG4gICAgfSwgW2ZpZWxkUGF0aCwgb25DaGFuZ2VdKTtcbiAgICBjb25zdCBpbnNlcnRBdEN1cnNvciA9ICgwLCByZWFjdF8xLnVzZUNhbGxiYWNrKSgodGV4dCkgPT4ge1xuICAgICAgICBjb25zdCB0YSA9IHRleHRhcmVhUmVmLmN1cnJlbnQ7XG4gICAgICAgIGlmICghdGEpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gdGEuc2VsZWN0aW9uU3RhcnQgPz8gdmFsdWUubGVuZ3RoO1xuICAgICAgICBjb25zdCBlbmQgPSB0YS5zZWxlY3Rpb25FbmQgPz8gdmFsdWUubGVuZ3RoO1xuICAgICAgICBjb25zdCBuZXh0ID0gdmFsdWUuc2xpY2UoMCwgc3RhcnQpICsgdGV4dCArIHZhbHVlLnNsaWNlKGVuZCk7XG4gICAgICAgIHNldFZhbHVlKG5leHQpO1xuICAgICAgICBvbkNoYW5nZShmaWVsZFBhdGgsIG5leHQpO1xuICAgICAgICBzZXRQcmV2aWV3KHJlbmRlck1hcmtkb3duKG5leHQpKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0YS5zZWxlY3Rpb25TdGFydCA9IHRhLnNlbGVjdGlvbkVuZCA9IHN0YXJ0ICsgdGV4dC5sZW5ndGg7XG4gICAgICAgICAgICB0YS5mb2N1cygpO1xuICAgICAgICB9LCAwKTtcbiAgICB9LCBbdmFsdWUsIGZpZWxkUGF0aCwgb25DaGFuZ2VdKTtcbiAgICBjb25zdCBoYW5kbGVVcGxvYWQgPSBhc3luYyAoZSkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gZS50YXJnZXQuZmlsZXM/LlswXTtcbiAgICAgICAgaWYgKCFmaWxlKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzZXRVcGxvYWRpbmcodHJ1ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBmZCA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICAgICAgZmQuYXBwZW5kKCdmaWxlJywgZmlsZSk7XG4gICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCgnL3YxL3VwbG9hZCcsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IGZkLCBjcmVkZW50aWFsczogJ2luY2x1ZGUnIH0pO1xuICAgICAgICAgICAgaWYgKCFyZXMub2spXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQICR7cmVzLnN0YXR1c31gKTtcbiAgICAgICAgICAgIGNvbnN0IHsgdXJsIH0gPSBhd2FpdCByZXMuanNvbigpO1xuICAgICAgICAgICAgaW5zZXJ0QXRDdXJzb3IoYCFbJHtmaWxlLm5hbWUucmVwbGFjZSgvXFwuW14uXSskLywgJycpfV0oJHt1cmx9KWApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGFsZXJ0KGBJbWFnZSB1cGxvYWQgZmFpbGVkOiAke2Vycj8ubWVzc2FnZSA/PyAndW5rbm93biBlcnJvcid9YCk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRVcGxvYWRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgaWYgKGZpbGVJbnB1dFJlZi5jdXJyZW50KVxuICAgICAgICAgICAgICAgIGZpbGVJbnB1dFJlZi5jdXJyZW50LnZhbHVlID0gJyc7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGVkaXRvclN0eWxlID0ge1xuICAgICAgICBmbGV4OiAxLCBmb250RmFtaWx5OiAnXCJGaXJhIENvZGVcIixcIkNhc2NhZGlhIENvZGVcIixcIkpldEJyYWlucyBNb25vXCIsbW9ub3NwYWNlJyxcbiAgICAgICAgZm9udFNpemU6ICcxM3B4JywgbGluZUhlaWdodDogJzEuNjUnLCBwYWRkaW5nOiAnMTJweCcsXG4gICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjMzM0MTU1JywgYm9yZGVyUmFkaXVzOiAnNnB4JywgcmVzaXplOiAnbm9uZScsXG4gICAgICAgIGJhY2tncm91bmQ6ICcjMGYxNzJhJywgY29sb3I6ICcjZTJlOGYwJywgbWluSGVpZ2h0OiAnNDYwcHgnLFxuICAgICAgICBib3hTaXppbmc6ICdib3JkZXItYm94Jywgb3ZlcmZsb3dZOiAnYXV0bycsXG4gICAgfTtcbiAgICBjb25zdCBwcmV2aWV3U3R5bGUgPSB7XG4gICAgICAgIGZsZXg6IDEsIHBhZGRpbmc6ICcxMnB4IDE2cHgnLCBib3JkZXI6ICcxcHggc29saWQgIzMzNDE1NScsIGJvcmRlclJhZGl1czogJzZweCcsXG4gICAgICAgIGJhY2tncm91bmQ6ICcjMGYxNzJhJywgY29sb3I6ICcjZTJlOGYwJywgbWluSGVpZ2h0OiAnNDYwcHgnLFxuICAgICAgICBvdmVyZmxvd1k6ICdhdXRvJywgZm9udFNpemU6ICcxNHB4JywgbGluZUhlaWdodDogJzEuNycsXG4gICAgICAgIGJveFNpemluZzogJ2JvcmRlci1ib3gnLFxuICAgIH07XG4gICAgY29uc3QgdGFiQnRuID0gKGFjdGl2ZSkgPT4gKHtcbiAgICAgICAgcGFkZGluZzogJzVweCAxNHB4JywgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNjAwLCBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICMzMzQxNTUnLCBib3JkZXJSYWRpdXM6ICc1cHgnLCBiYWNrZ3JvdW5kOiBhY3RpdmUgPyAnIzYzNjZmMScgOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICBjb2xvcjogYWN0aXZlID8gJyNmZmYnIDogJyM5NGEzYjgnLFxuICAgIH0pO1xuICAgIGNvbnN0IHNob3dFZGl0b3IgPSBhY3RpdmVUYWIgIT09ICdwcmV2aWV3JztcbiAgICBjb25zdCBzaG93UHJldmlldyA9IGFjdGl2ZVRhYiAhPT0gJ2VkaXRvcic7XG4gICAgcmV0dXJuIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogJzhweCcgfSB9LFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnNnB4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGZsZXhXcmFwOiAnd3JhcCcgfSB9LFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzRweCcgfSB9LCBbJ3NwbGl0JywgJ2VkaXRvcicsICdwcmV2aWV3J10ubWFwKHQgPT4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHsga2V5OiB0LCB0eXBlOiBcImJ1dHRvblwiLCBzdHlsZTogdGFiQnRuKGFjdGl2ZVRhYiA9PT0gdCksIG9uQ2xpY2s6ICgpID0+IHNldEFjdGl2ZVRhYih0KSB9LCB0ID09PSAnc3BsaXQnID8gJ+KKnyBTcGxpdCcgOiB0ID09PSAnZWRpdG9yJyA/ICfinI8gRWRpdG9yJyA6ICfwn5GBIFByZXZpZXcnKSkpKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZmxleDogMSB9IH0pLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdCJywgdGl0bGU6ICdCb2xkJywgaW5zZXJ0OiAnKipib2xkKionIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0knLCB0aXRsZTogJ0l0YWxpYycsIGluc2VydDogJyppdGFsaWMqJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdIJywgdGl0bGU6ICdIZWFkaW5nJywgaW5zZXJ0OiAnIyMgSGVhZGluZ1xcbicgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnYCcsIHRpdGxlOiAnSW5saW5lIGNvZGUnLCBpbnNlcnQ6ICdgY29kZWAnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ+KJoScsIHRpdGxlOiAnQ29kZSBibG9jaycsIGluc2VydDogJ2BgYFxcbmNvZGVcXG5gYGBcXG4nIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ+KGkicsIHRpdGxlOiAnTGluaycsIGluc2VydDogJ1t0ZXh0XSh1cmwpJyB9LFxuICAgICAgICAgICAgXS5tYXAoKHsgbGFiZWwsIHRpdGxlLCBpbnNlcnQgfSkgPT4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHsga2V5OiBsYWJlbCwgdHlwZTogXCJidXR0b25cIiwgdGl0bGU6IHRpdGxlLCBvbkNsaWNrOiAoKSA9PiBpbnNlcnRBdEN1cnNvcihpbnNlcnQpLCBzdHlsZTogeyBwYWRkaW5nOiAnNHB4IDEwcHgnLCBmb250U2l6ZTogJzEycHgnLCBmb250V2VpZ2h0OiA3MDAsIGJvcmRlcjogJzFweCBzb2xpZCAjMzM0MTU1JywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogJ3RyYW5zcGFyZW50JywgY29sb3I6ICcjOTRhM2I4JywgY3Vyc29yOiAncG9pbnRlcicgfSB9LCBsYWJlbCkpKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgZGlzYWJsZWQ6IHVwbG9hZGluZywgb25DbGljazogKCkgPT4gZmlsZUlucHV0UmVmLmN1cnJlbnQ/LmNsaWNrKCksIHN0eWxlOiB7IHBhZGRpbmc6ICc1cHggMTJweCcsIGZvbnRTaXplOiAnMTJweCcsIGZvbnRXZWlnaHQ6IDYwMCwgYm9yZGVyOiAnMXB4IHNvbGlkICM2MzY2ZjEnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiB1cGxvYWRpbmcgPyAnIzFlMjkzYicgOiAnIzYzNjZmMTIwJywgY29sb3I6ICcjODE4Y2Y4JywgY3Vyc29yOiB1cGxvYWRpbmcgPyAnbm90LWFsbG93ZWQnIDogJ3BvaW50ZXInIH0gfSwgdXBsb2FkaW5nID8gJ+KPsyBVcGxvYWRpbmfigKYnIDogJ/Cfk7cgSW1hZ2UnKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyByZWY6IGZpbGVJbnB1dFJlZiwgdHlwZTogXCJmaWxlXCIsIGFjY2VwdDogXCJpbWFnZS8qXCIsIHN0eWxlOiB7IGRpc3BsYXk6ICdub25lJyB9LCBvbkNoYW5nZTogaGFuZGxlVXBsb2FkIH0pKSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzhweCcgfSB9LFxuICAgICAgICAgICAgc2hvd0VkaXRvciAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJ0ZXh0YXJlYVwiLCB7IHJlZjogdGV4dGFyZWFSZWYsIHZhbHVlOiB2YWx1ZSwgb25DaGFuZ2U6IGhhbmRsZUNoYW5nZSwgc3BlbGxDaGVjazogZmFsc2UsIHN0eWxlOiBlZGl0b3JTdHlsZSwgcGxhY2Vob2xkZXI6IFwiV3JpdGUgTWFya2Rvd24gaGVyZVxcdTIwMjZcIiB9KSksXG4gICAgICAgICAgICBzaG93UHJldmlldyAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogcHJldmlld1N0eWxlLCBkYW5nZXJvdXNseVNldElubmVySFRNTDogeyBfX2h0bWw6IHByZXZpZXcgfHwgJzxzcGFuIHN0eWxlPVwiY29sb3I6IzQ3NTU2OVwiPlByZXZpZXcgd2lsbCBhcHBlYXIgaGVyZeKApjwvc3Bhbj4nIH0gfSkpKSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJwXCIsIHsgc3R5bGU6IHsgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjNDc1NTY5JywgbWFyZ2luOiAwIH0gfSwgXCJHRk0gc3VwcG9ydGVkIFxcdTAwQjcgcHJldmlldyBkZWJvdW5jZWQgMzAwIG1zIFxcdTAwQjcgQ3RybCtaIHRvIHVuZG9cIikpKTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBNYXJrZG93bkVkaXRvcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcmtkb3duLWVkaXRvci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3duS2V5cyA9IGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgb3duS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgICB2YXIgYXIgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGsgaW4gbykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBrKSkgYXJbYXIubGVuZ3RoXSA9IGs7XG4gICAgICAgICAgICByZXR1cm4gYXI7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBvd25LZXlzKG8pO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtb2QpIHtcbiAgICAgICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgPSBvd25LZXlzKG1vZCksIGkgPSAwOyBpIDwgay5sZW5ndGg7IGkrKykgaWYgKGtbaV0gIT09IFwiZGVmYXVsdFwiKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGtbaV0pO1xuICAgICAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgcmVhY3RfMSA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwicmVhY3RcIikpO1xuY29uc3QgYWRtaW5qc18xID0gcmVxdWlyZShcImFkbWluanNcIik7XG5jb25zdCBhcGkgPSBuZXcgYWRtaW5qc18xLkFwaUNsaWVudCgpO1xuY29uc3QgVGFnUGlja2VyID0gKHsgcHJvcGVydHksIHJlY29yZCwgb25DaGFuZ2UgfSkgPT4ge1xuICAgIGNvbnN0IFthbGxUYWdzLCBzZXRBbGxUYWdzXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShbXSk7XG4gICAgY29uc3QgW3NlbGVjdGVkLCBzZXRTZWxlY3RlZF0gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoW10pO1xuICAgIGNvbnN0IFtxdWVyeSwgc2V0UXVlcnldID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKCcnKTtcbiAgICBjb25zdCBbc2hvd0Ryb3Bkb3duLCBzZXRTaG93RHJvcGRvd25dID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKGZhbHNlKTtcbiAgICBjb25zdCBpbnB1dFJlZiA9ICgwLCByZWFjdF8xLnVzZVJlZikobnVsbCk7XG4gICAgKDAsIHJlYWN0XzEudXNlRWZmZWN0KSgoKSA9PiB7XG4gICAgICAgIGZldGNoKCcvdjEvYmxvZy90YWdzJywgeyBjcmVkZW50aWFsczogJ2luY2x1ZGUnIH0pXG4gICAgICAgICAgICAudGhlbihyID0+IHIuanNvbigpKVxuICAgICAgICAgICAgLnRoZW4oKHRhZ3MpID0+IHNldEFsbFRhZ3ModGFncykpXG4gICAgICAgICAgICAuY2F0Y2goKCkgPT4geyB9KTtcbiAgICAgICAgY29uc3QgcG9wdWxhdGVkID0gcmVjb3JkPy5wb3B1bGF0ZWQ/Lltwcm9wZXJ0eS5wYXRoXSA/PyBbXTtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHBvcHVsYXRlZFxuICAgICAgICAgICAgLm1hcCgocikgPT4gKHsgaWQ6IHIucGFyYW1zPy5pZCwgbmFtZTogci5wYXJhbXM/Lm5hbWUgfSkpXG4gICAgICAgICAgICAuZmlsdGVyKCh0KSA9PiB0LmlkICYmIHQubmFtZSk7XG4gICAgICAgIHNldFNlbGVjdGVkKGN1cnJlbnQpO1xuICAgIH0sIFtyZWNvcmQ/LmlkXSk7XG4gICAgY29uc3QgZW1pdCA9ICh0YWdzKSA9PiB7XG4gICAgICAgIG9uQ2hhbmdlKHByb3BlcnR5LnBhdGgsIHRhZ3MubWFwKHQgPT4gdC5pZCkpO1xuICAgIH07XG4gICAgY29uc3QgYWRkVGFnID0gKHRhZykgPT4ge1xuICAgICAgICBpZiAoc2VsZWN0ZWQuc29tZShzID0+IHMuaWQgPT09IHRhZy5pZCkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IG5leHQgPSBbLi4uc2VsZWN0ZWQsIHRhZ107XG4gICAgICAgIHNldFNlbGVjdGVkKG5leHQpO1xuICAgICAgICBlbWl0KG5leHQpO1xuICAgICAgICBzZXRRdWVyeSgnJyk7XG4gICAgICAgIHNldFNob3dEcm9wZG93bihmYWxzZSk7XG4gICAgfTtcbiAgICBjb25zdCByZW1vdmVUYWcgPSAoaWQpID0+IHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHNlbGVjdGVkLmZpbHRlcih0ID0+IHQuaWQgIT09IGlkKTtcbiAgICAgICAgc2V0U2VsZWN0ZWQobmV4dCk7XG4gICAgICAgIGVtaXQobmV4dCk7XG4gICAgfTtcbiAgICBjb25zdCBjcmVhdGVUYWcgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBxdWVyeS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBleGlzdGluZyA9IGFsbFRhZ3MuZmluZCh0ID0+IHQubmFtZSA9PT0gbmFtZSk7XG4gICAgICAgIGlmIChleGlzdGluZykge1xuICAgICAgICAgICAgYWRkVGFnKGV4aXN0aW5nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgYXBpLnJlc291cmNlQWN0aW9uKHtcbiAgICAgICAgICAgICAgICByZXNvdXJjZUlkOiAnVGFnJyxcbiAgICAgICAgICAgICAgICBhY3Rpb25OYW1lOiAnbmV3JyxcbiAgICAgICAgICAgICAgICBkYXRhOiB7IG5hbWUgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgY3JlYXRlZCA9IHtcbiAgICAgICAgICAgICAgICBpZDogcmVzLmRhdGE/LnJlY29yZD8ucGFyYW1zPy5pZCxcbiAgICAgICAgICAgICAgICBuYW1lOiByZXMuZGF0YT8ucmVjb3JkPy5wYXJhbXM/Lm5hbWUgPz8gbmFtZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZXRBbGxUYWdzKHByZXYgPT4gWy4uLnByZXYsIGNyZWF0ZWRdLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpKTtcbiAgICAgICAgICAgIGFkZFRhZyhjcmVhdGVkKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICBhbGVydChgQ291bGQgbm90IGNyZWF0ZSB0YWcgXCIke25hbWV9XCIuIFBsZWFzZSB0cnkgYWdhaW4uYCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGZpbHRlcmVkID0gYWxsVGFncy5maWx0ZXIodCA9PiB0Lm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeS50b0xvd2VyQ2FzZSgpKSAmJlxuICAgICAgICAhc2VsZWN0ZWQuc29tZShzID0+IHMuaWQgPT09IHQuaWQpKTtcbiAgICBjb25zdCBjaGlwID0ge1xuICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnNHB4JyxcbiAgICAgICAgcGFkZGluZzogJzNweCAxMHB4JywgYmFja2dyb3VuZENvbG9yOiAnIzNkNWFmMScsIGNvbG9yOiAnI2ZmZicsXG4gICAgICAgIGJvcmRlclJhZGl1czogJzIwcHgnLCBmb250U2l6ZTogJzEycHgnLCBmb250V2VpZ2h0OiA1MDAsXG4gICAgfTtcbiAgICBjb25zdCByZW1vdmVCdG4gPSB7XG4gICAgICAgIGJhY2tncm91bmQ6ICdub25lJywgYm9yZGVyOiAnbm9uZScsIGNvbG9yOiAnI2ZmZicsXG4gICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLCBsaW5lSGVpZ2h0OiAxLCBwYWRkaW5nOiAnMCAwIDAgMnB4JywgZm9udFNpemU6ICcxNHB4JyxcbiAgICB9O1xuICAgIHJldHVybiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9IH0sXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4V3JhcDogJ3dyYXAnLCBnYXA6ICc2cHgnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBtaW5IZWlnaHQ6ICcyOHB4JyB9IH0sIHNlbGVjdGVkLm1hcCh0YWcgPT4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7IGtleTogdGFnLmlkLCBzdHlsZTogY2hpcCB9LFxuICAgICAgICAgICAgdGFnLm5hbWUsXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIHN0eWxlOiByZW1vdmVCdG4sIG9uQ2xpY2s6ICgpID0+IHJlbW92ZVRhZyh0YWcuaWQpIH0sIFwiXFx1MDBEN1wiKSkpKSksXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICc2cHgnIH0gfSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyByZWY6IGlucHV0UmVmLCB0eXBlOiBcInRleHRcIiwgdmFsdWU6IHF1ZXJ5LCBvbkNoYW5nZTogZSA9PiB7IHNldFF1ZXJ5KGUudGFyZ2V0LnZhbHVlKTsgc2V0U2hvd0Ryb3Bkb3duKHRydWUpOyB9LCBvbkZvY3VzOiAoKSA9PiBzZXRTaG93RHJvcGRvd24odHJ1ZSksIG9uQmx1cjogKCkgPT4gc2V0VGltZW91dCgoKSA9PiBzZXRTaG93RHJvcGRvd24oZmFsc2UpLCAyMDApLCBvbktleURvd246IGUgPT4geyBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVUYWcoKTtcbiAgICAgICAgICAgICAgICB9IH0sIHBsYWNlaG9sZGVyOiBcIlNlYXJjaCBvciBjcmVhdGUgYSB0YWdcXHUyMDI2XCIsIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgIGZsZXg6IDEsIHBhZGRpbmc6ICc3cHggMTFweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjNGE0YTZhJyxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNXB4JywgZm9udFNpemU6ICcxM3B4JywgYmFja2dyb3VuZENvbG9yOiAnIzFhMWEyZScsIGNvbG9yOiAnI2UwZTBlMCcsXG4gICAgICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgICAgIHF1ZXJ5LnRyaW0oKSAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBvbkNsaWNrOiBjcmVhdGVUYWcsIHN0eWxlOiB7IHBhZGRpbmc6ICc3cHggMTRweCcsIGJhY2tncm91bmRDb2xvcjogJyMyMmM1NWUnLCBjb2xvcjogJyNmZmYnLCBib3JkZXI6ICdub25lJywgYm9yZGVyUmFkaXVzOiAnNXB4JywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTNweCcsIGZvbnRXZWlnaHQ6IDUwMCB9IH0sIFwiKyBBZGRcIikpKSxcbiAgICAgICAgc2hvd0Ryb3Bkb3duICYmIGZpbHRlcmVkLmxlbmd0aCA+IDAgJiYgKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwidWxcIiwgeyBzdHlsZToge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICcxMDAlJywgbGVmdDogMCwgcmlnaHQ6IDAsIHpJbmRleDogOTk5OSxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmJywgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc1cHgnLFxuICAgICAgICAgICAgICAgIGxpc3RTdHlsZTogJ25vbmUnLCBtYXJnaW46ICcycHggMCcsIHBhZGRpbmc6IDAsIG1heEhlaWdodDogJzIwMHB4Jywgb3ZlcmZsb3dZOiAnYXV0bycsXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCA0cHggMTJweCByZ2JhKDAsMCwwLDAuMTUpJyxcbiAgICAgICAgICAgIH0gfSwgZmlsdGVyZWQubWFwKHRhZyA9PiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJsaVwiLCB7IGtleTogdGFnLmlkLCBvbk1vdXNlRG93bjogKCkgPT4gYWRkVGFnKHRhZyksIHN0eWxlOiB7IHBhZGRpbmc6ICc4cHggMTJweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEzcHgnLCBjb2xvcjogJyMzMzMnIH0gfSwgdGFnLm5hbWUpKSkpKSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJwXCIsIHsgc3R5bGU6IHsgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjODg4JywgbWFyZ2luOiAnNnB4IDAgMCcgfSB9LCBcIlR5cGUgdG8gc2VhcmNoIGV4aXN0aW5nIHRhZ3MgXFx1MDBCNyBwcmVzcyBFbnRlciBvciBjbGljayBcXFwiKyBBZGRcXFwiIHRvIGNyZWF0ZSBuZXdcIikpKTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBUYWdQaWNrZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10YWctcGlja2VyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBvd25LZXlzID0gZnVuY3Rpb24obykge1xuICAgICAgICBvd25LZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgIHZhciBhciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBvKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspKSBhclthci5sZW5ndGhdID0gaztcbiAgICAgICAgICAgIHJldHVybiBhcjtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG93bktleXMobyk7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1vZCkge1xuICAgICAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayA9IG93bktleXMobW9kKSwgaSA9IDA7IGkgPCBrLmxlbmd0aDsgaSsrKSBpZiAoa1tpXSAhPT0gXCJkZWZhdWx0XCIpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwga1tpXSk7XG4gICAgICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBTa2lsbFBpY2tlcjtcbmNvbnN0IHJlYWN0XzEgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcInJlYWN0XCIpKTtcbmZ1bmN0aW9uIFNraWxsUGlja2VyKHsgcHJvcGVydHksIHJlY29yZCwgb25DaGFuZ2UgfSkge1xuICAgIGNvbnN0IFtza2lsbHMsIHNldFNraWxsc10gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoW10pO1xuICAgIGNvbnN0IFtxdWVyeSwgc2V0UXVlcnldID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKCcnKTtcbiAgICBjb25zdCBbc2VsZWN0ZWQsIHNldFNlbGVjdGVkXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShbXSk7XG4gICAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKGZhbHNlKTtcbiAgICAoMCwgcmVhY3RfMS51c2VFZmZlY3QpKCgpID0+IHtcbiAgICAgICAgY29uc3QgaWRzID0gW107XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHJlY29yZC5wYXJhbXMgPz8ge30pLmZvckVhY2goKFtrZXksIHZhbF0pID0+IHtcbiAgICAgICAgICAgIGlmIChrZXkuc3RhcnRzV2l0aChgJHtwcm9wZXJ0eS5wYXRofS5gKSAmJiBrZXkuZW5kc1dpdGgoJy5pZCcpKSB7XG4gICAgICAgICAgICAgICAgaWRzLnB1c2godmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHBvcHVsYXRlZCA9IChyZWNvcmQucG9wdWxhdGVkID8/IHt9KVtwcm9wZXJ0eS5wYXRoXTtcbiAgICAgICAgaWYgKHBvcHVsYXRlZCkge1xuICAgICAgICAgICAgaWRzLnB1c2goLi4ucG9wdWxhdGVkLm1hcCgocykgPT4gcy5wYXJhbXM/LmlkID8/IHMuaWQpLmZpbHRlcihCb29sZWFuKSk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0U2VsZWN0ZWQoWy4uLm5ldyBTZXQoaWRzKV0pO1xuICAgIH0sIFtdKTtcbiAgICAoMCwgcmVhY3RfMS51c2VFZmZlY3QpKCgpID0+IHtcbiAgICAgICAgc2V0TG9hZGluZyh0cnVlKTtcbiAgICAgICAgY29uc3QgYmFzZSA9IHdpbmRvdy5fX0FQSV9CQVNFX19cbiAgICAgICAgICAgID8/IGAke3dpbmRvdy5sb2NhdGlvbi5wcm90b2NvbH0vLyR7d2luZG93LmxvY2F0aW9uLmhvc3RuYW1lfTozMDAxYDtcbiAgICAgICAgZmV0Y2goYCR7YmFzZX0vdjEvcmVzdW1lYClcbiAgICAgICAgICAgIC50aGVuKChyKSA9PiByLmpzb24oKSlcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiBzZXRTa2lsbHMoZGF0YT8uc2tpbGxzID8/IFtdKSlcbiAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7IH0pXG4gICAgICAgICAgICAuZmluYWxseSgoKSA9PiBzZXRMb2FkaW5nKGZhbHNlKSk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IHRvZ2dsZSA9ICgwLCByZWFjdF8xLnVzZUNhbGxiYWNrKSgoaWQpID0+IHtcbiAgICAgICAgc2V0U2VsZWN0ZWQoKHByZXYpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5leHQgPSBwcmV2LmluY2x1ZGVzKGlkKSA/IHByZXYuZmlsdGVyKCh4KSA9PiB4ICE9PSBpZCkgOiBbLi4ucHJldiwgaWRdO1xuICAgICAgICAgICAgb25DaGFuZ2UocHJvcGVydHkucGF0aCwgbmV4dCk7XG4gICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfSk7XG4gICAgfSwgW29uQ2hhbmdlLCBwcm9wZXJ0eS5wYXRoXSk7XG4gICAgY29uc3QgZmlsdGVyZWQgPSBxdWVyeVxuICAgICAgICA/IHNraWxscy5maWx0ZXIoKHMpID0+IHMubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHF1ZXJ5LnRvTG93ZXJDYXNlKCkpKVxuICAgICAgICA6IHNraWxscztcbiAgICBjb25zdCBjYXRlZ29yaWVzID0gWy4uLm5ldyBTZXQoZmlsdGVyZWQubWFwKChzKSA9PiBzLmNhdGVnb3J5KSldLnNvcnQoKTtcbiAgICByZXR1cm4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiA4IH0gfSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogNjAwLCB0ZXh0VHJhbnNmb3JtOiAndXBwZXJjYXNlJywgbGV0dGVyU3BhY2luZzogMSwgb3BhY2l0eTogMC43IH0gfSwgcHJvcGVydHkubGFiZWwpLFxuICAgICAgICBzZWxlY3RlZC5sZW5ndGggPiAwICYmIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleFdyYXA6ICd3cmFwJywgZ2FwOiA0IH0gfSwgc2VsZWN0ZWQubWFwKChpZCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2sgPSBza2lsbHMuZmluZCgocykgPT4gcy5pZCA9PT0gaWQpO1xuICAgICAgICAgICAgcmV0dXJuIHNrID8gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7IGtleTogaWQsIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcycHggOHB4JywgYm9yZGVyUmFkaXVzOiA0LCBmb250U2l6ZTogMTEsIGZvbnRXZWlnaHQ6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ3JnYmEoOTksMTAyLDI0MSwwLjE1KScsIGJvcmRlcjogJzFweCBzb2xpZCByZ2JhKDk5LDEwMiwyNDEsMC4zNSknLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6IDQsIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICAgICAgICAgIH0sIG9uQ2xpY2s6ICgpID0+IHRvZ2dsZShpZCkgfSxcbiAgICAgICAgICAgICAgICBzay5uYW1lLFxuICAgICAgICAgICAgICAgIFwiIFxcdTI3MTVcIikpIDogbnVsbDtcbiAgICAgICAgfSkpKSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7IHR5cGU6IFwidGV4dFwiLCBwbGFjZWhvbGRlcjogXCJGaWx0ZXIgc2tpbGxzLi4uXCIsIHZhbHVlOiBxdWVyeSwgb25DaGFuZ2U6IChlKSA9PiBzZXRRdWVyeShlLnRhcmdldC52YWx1ZSksIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJywgcGFkZGluZzogJzZweCAxMHB4JywgYm9yZGVyUmFkaXVzOiA2LFxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCByZ2JhKDEyOCwxMjgsMTI4LDAuMyknLCBiYWNrZ3JvdW5kOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMywgY29sb3I6ICdpbmhlcml0JywgYm94U2l6aW5nOiAnYm9yZGVyLWJveCcsXG4gICAgICAgICAgICB9IH0pLFxuICAgICAgICBsb2FkaW5nICYmIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMiwgb3BhY2l0eTogMC42IH0gfSwgXCJMb2FkaW5nIHNraWxsc1xcdTIwMjZcIiksXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgbWF4SGVpZ2h0OiAyMjAsIG92ZXJmbG93WTogJ2F1dG8nLCBib3JkZXI6ICcxcHggc29saWQgcmdiYSgxMjgsMTI4LDEyOCwwLjIpJywgYm9yZGVyUmFkaXVzOiA2LCBwYWRkaW5nOiA4IH0gfSxcbiAgICAgICAgICAgIGNhdGVnb3JpZXMubWFwKChjYXQpID0+IChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IGtleTogY2F0LCBzdHlsZTogeyBtYXJnaW5Cb3R0b206IDEwIH0gfSxcbiAgICAgICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMCwgZm9udFdlaWdodDogNzAwLCB0ZXh0VHJhbnNmb3JtOiAndXBwZXJjYXNlJywgbGV0dGVyU3BhY2luZzogMSwgb3BhY2l0eTogMC41LCBtYXJnaW5Cb3R0b206IDQgfSB9LCBjYXQpLFxuICAgICAgICAgICAgICAgIGZpbHRlcmVkLmZpbHRlcigocykgPT4gcy5jYXRlZ29yeSA9PT0gY2F0KS5tYXAoKHNraWxsKSA9PiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiLCB7IGtleTogc2tpbGwuaWQsIHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogNiwgZm9udFNpemU6IDEzLCBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzJweCAwJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNoZWNrZWQ6IHNlbGVjdGVkLmluY2x1ZGVzKHNraWxsLmlkKSwgb25DaGFuZ2U6ICgpID0+IHRvZ2dsZShza2lsbC5pZCksIHN0eWxlOiB7IHdpZHRoOiAxNCwgaGVpZ2h0OiAxNCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICBza2lsbC5uYW1lKSkpKSkpLFxuICAgICAgICAgICAgZmlsdGVyZWQubGVuZ3RoID09PSAwICYmICFsb2FkaW5nICYmIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTIsIG9wYWNpdHk6IDAuNSB9IH0sIFwiTm8gc2tpbGxzIGZvdW5kLlwiKSkpKSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1za2lsbC1waWNrZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcbiAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19zZXRNb2R1bGVEZWZhdWx0KSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xufSkgOiBmdW5jdGlvbihvLCB2KSB7XG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xufSk7XG52YXIgX19pbXBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydFN0YXIpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG93bktleXMgPSBmdW5jdGlvbihvKSB7XG4gICAgICAgIG93bktleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgdmFyIGFyID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBrIGluIG8pIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobywgaykpIGFyW2FyLmxlbmd0aF0gPSBrO1xuICAgICAgICAgICAgcmV0dXJuIGFyO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gb3duS2V5cyhvKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAobW9kKSB7XG4gICAgICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrID0gb3duS2V5cyhtb2QpLCBpID0gMDsgaSA8IGsubGVuZ3RoOyBpKyspIGlmIChrW2ldICE9PSBcImRlZmF1bHRcIikgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrW2ldKTtcbiAgICAgICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xufSkoKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IE1lZGlhVXBsb2FkZXI7XG5jb25zdCByZWFjdF8xID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5mdW5jdGlvbiBNZWRpYVVwbG9hZGVyKHsgcHJvcGVydHksIHJlY29yZCwgb25DaGFuZ2UgfSkge1xuICAgIGNvbnN0IGFwaUJhc2UgPSB3aW5kb3cuX19BUElfQkFTRV9fXG4gICAgICAgID8/IGAke3dpbmRvdy5sb2NhdGlvbi5wcm90b2NvbH0vLyR7d2luZG93LmxvY2F0aW9uLmhvc3RuYW1lfTozMDAxYDtcbiAgICBjb25zdCBpbml0aWFsID0gW107XG4gICAgaWYgKHJlY29yZD8ucGFyYW1zKSB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgd2hpbGUgKHJlY29yZC5wYXJhbXNbYCR7cHJvcGVydHkucGF0aH0uJHtpfS51cmxgXSkge1xuICAgICAgICAgICAgaW5pdGlhbC5wdXNoKHtcbiAgICAgICAgICAgICAgICBpZDogcmVjb3JkLnBhcmFtc1tgJHtwcm9wZXJ0eS5wYXRofS4ke2l9LmlkYF0gPz8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHVybDogcmVjb3JkLnBhcmFtc1tgJHtwcm9wZXJ0eS5wYXRofS4ke2l9LnVybGBdLFxuICAgICAgICAgICAgICAgIGFsdFRleHQ6IHJlY29yZC5wYXJhbXNbYCR7cHJvcGVydHkucGF0aH0uJHtpfS5hbHRUZXh0YF0gPz8gJycsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBbaXRlbXMsIHNldEl0ZW1zXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShpbml0aWFsKTtcbiAgICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShmYWxzZSk7XG4gICAgY29uc3QgZHJhZ0lkeCA9ICgwLCByZWFjdF8xLnVzZVJlZikobnVsbCk7XG4gICAgY29uc3QgZmlsZVJlZiA9ICgwLCByZWFjdF8xLnVzZVJlZikobnVsbCk7XG4gICAgY29uc3QgZW1pdCA9ICgwLCByZWFjdF8xLnVzZUNhbGxiYWNrKSgobmV4dCkgPT4ge1xuICAgICAgICBzZXRJdGVtcyhuZXh0KTtcbiAgICAgICAgb25DaGFuZ2UocHJvcGVydHkucGF0aCwgbmV4dC5maWx0ZXIoKG0pID0+ICFtLnVwbG9hZGluZyAmJiAhbS5lcnJvcikpO1xuICAgIH0sIFtvbkNoYW5nZSwgcHJvcGVydHkucGF0aF0pO1xuICAgIGNvbnN0IHVwbG9hZEZpbGVzID0gYXN5bmMgKGZpbGVzKSA9PiB7XG4gICAgICAgIGlmICghZmlsZXMgfHwgIWZpbGVzLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgcGxhY2Vob2xkZXJzID0gQXJyYXkuZnJvbShmaWxlcykubWFwKChmKSA9PiAoe1xuICAgICAgICAgICAgdXJsOiBVUkwuY3JlYXRlT2JqZWN0VVJMKGYpLCBhbHRUZXh0OiAnJywgdXBsb2FkaW5nOiB0cnVlLFxuICAgICAgICB9KSk7XG4gICAgICAgIHNldEl0ZW1zKChwcmV2KSA9PiBbLi4ucHJldiwgLi4ucGxhY2Vob2xkZXJzXSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBmaWxlc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IGZkID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgICAgICBmZC5hcHBlbmQoJ2ZpbGUnLCBmaWxlKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7YXBpQmFzZX0vdjEvdXBsb2FkYCwge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJywgYm9keTogZmQsIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXMub2spXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVXBsb2FkIGZhaWxlZDogJHtyZXMuc3RhdHVzfWApO1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgdXJsIH0gPSBhd2FpdCByZXMuanNvbigpO1xuICAgICAgICAgICAgICAgIHNldEl0ZW1zKChwcmV2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSBbLi4ucHJldl07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IG5leHQuZmluZEluZGV4KChtKSA9PiBtLnVwbG9hZGluZyAmJiBtLnVybCA9PT0gcGxhY2Vob2xkZXJzW2ldLnVybCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZHggIT09IC0xKVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFtpZHhdID0geyB1cmwsIGFsdFRleHQ6ICcnLCB1cGxvYWRpbmc6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlKHByb3BlcnR5LnBhdGgsIG5leHQuZmlsdGVyKChtKSA9PiAhbS51cGxvYWRpbmcpKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgc2V0SXRlbXMoKHByZXYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IFsuLi5wcmV2XTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gbmV4dC5maW5kSW5kZXgoKG0pID0+IG0udXBsb2FkaW5nICYmIG0udXJsID09PSBwbGFjZWhvbGRlcnNbaV0udXJsKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlkeCAhPT0gLTEpXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0W2lkeF0gPSB7IC4uLm5leHRbaWR4XSwgdXBsb2FkaW5nOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBvbkRyYWdTdGFydCA9IChpKSA9PiB7IGRyYWdJZHguY3VycmVudCA9IGk7IH07XG4gICAgY29uc3Qgb25EcmFnT3ZlciA9IChlLCBpKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKGRyYWdJZHguY3VycmVudCA9PT0gbnVsbCB8fCBkcmFnSWR4LmN1cnJlbnQgPT09IGkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHNldEl0ZW1zKChwcmV2KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXh0ID0gWy4uLnByZXZdO1xuICAgICAgICAgICAgY29uc3QgW21vdmVkXSA9IG5leHQuc3BsaWNlKGRyYWdJZHguY3VycmVudCwgMSk7XG4gICAgICAgICAgICBuZXh0LnNwbGljZShpLCAwLCBtb3ZlZCk7XG4gICAgICAgICAgICBkcmFnSWR4LmN1cnJlbnQgPSBpO1xuICAgICAgICAgICAgb25DaGFuZ2UocHJvcGVydHkucGF0aCwgbmV4dC5maWx0ZXIoKG0pID0+ICFtLnVwbG9hZGluZykpO1xuICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgY29uc3Qgb25Ecm9wWm9uZSA9IChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2V0RHJhZ2dpbmcoZmFsc2UpO1xuICAgICAgICB1cGxvYWRGaWxlcyhlLmRhdGFUcmFuc2Zlci5maWxlcyk7XG4gICAgfTtcbiAgICByZXR1cm4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAxMiB9IH0sXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgb25EcmFnT3ZlcjogKGUpID0+IHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBzZXREcmFnZ2luZyh0cnVlKTsgfSwgb25EcmFnTGVhdmU6ICgpID0+IHNldERyYWdnaW5nKGZhbHNlKSwgb25Ecm9wOiBvbkRyb3Bab25lLCBvbkNsaWNrOiAoKSA9PiBmaWxlUmVmLmN1cnJlbnQ/LmNsaWNrKCksIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgYm9yZGVyOiBgMnB4IGRhc2hlZCAke2RyYWdnaW5nID8gJyM4MThjZjgnIDogJ3JnYmEoMTI4LDEyOCwxMjgsMC4zKSd9YCxcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDgsIHBhZGRpbmc6ICcyNHB4IDE2cHgnLCB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLCBiYWNrZ3JvdW5kOiBkcmFnZ2luZyA/ICdyZ2JhKDk5LDEwMiwyNDEsMC4wNSknIDogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnYWxsIDE1MG1zJyxcbiAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMywgb3BhY2l0eTogMC43IH0gfSxcbiAgICAgICAgICAgICAgICBcIkRyb3AgaW1hZ2VzIGhlcmUgb3IgXCIsXG4gICAgICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJzdHJvbmdcIiwgbnVsbCwgXCJjbGljayB0byBicm93c2VcIikpLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7IHJlZjogZmlsZVJlZiwgdHlwZTogXCJmaWxlXCIsIG11bHRpcGxlOiB0cnVlLCBhY2NlcHQ6IFwiaW1hZ2UvKlwiLCBzdHlsZTogeyBkaXNwbGF5OiAnbm9uZScgfSwgb25DaGFuZ2U6IChlKSA9PiB1cGxvYWRGaWxlcyhlLnRhcmdldC5maWxlcykgfSkpLFxuICAgICAgICBpdGVtcy5sZW5ndGggPiAwICYmIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpbGwsIG1pbm1heCgxMjBweCwgMWZyKSknLCBnYXA6IDggfSB9LCBpdGVtcy5tYXAoKGl0ZW0sIGkpID0+IChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IGtleTogaSwgZHJhZ2dhYmxlOiAhaXRlbS51cGxvYWRpbmcsIG9uRHJhZ1N0YXJ0OiAoKSA9PiBvbkRyYWdTdGFydChpKSwgb25EcmFnT3ZlcjogKGUpID0+IG9uRHJhZ092ZXIoZSwgaSksIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsIGJvcmRlclJhZGl1czogOCwgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCByZ2JhKDEyOCwxMjgsMTI4LDAuMiknLCBjdXJzb3I6IGl0ZW0udXBsb2FkaW5nID8gJ2RlZmF1bHQnIDogJ2dyYWInLFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IGl0ZW0udXBsb2FkaW5nID8gMC42IDogMSxcbiAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaW1nXCIsIHsgc3JjOiBpdGVtLnVybCwgYWx0OiBpdGVtLmFsdFRleHQsIHN0eWxlOiB7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogODAsIG9iamVjdEZpdDogJ2NvdmVyJywgZGlzcGxheTogJ2Jsb2NrJyB9IH0pLFxuICAgICAgICAgICAgaXRlbS51cGxvYWRpbmcgJiYgKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgcG9zaXRpb246ICdhYnNvbHV0ZScsIGluc2V0OiAwLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIGJhY2tncm91bmQ6ICdyZ2JhKDAsMCwwLDAuNCknLCBmb250U2l6ZTogMTAsIGNvbG9yOiAnI2ZmZicgfSB9LCBcIlVwbG9hZGluZ1xcdTIwMjZcIikpLFxuICAgICAgICAgICAgaXRlbS5lcnJvciAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBwb3NpdGlvbjogJ2Fic29sdXRlJywgaW5zZXQ6IDAsIGJhY2tncm91bmQ6ICdyZ2JhKDIyMCwzOCwzOCwwLjcpJywgZm9udFNpemU6IDksIGNvbG9yOiAnI2ZmZicsIHBhZGRpbmc6IDQsIG92ZXJmbG93OiAnaGlkZGVuJyB9IH0sIGl0ZW0uZXJyb3IpKSxcbiAgICAgICAgICAgICFpdGVtLnVwbG9hZGluZyAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQocmVhY3RfMS5kZWZhdWx0LkZyYWdtZW50LCBudWxsLFxuICAgICAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiwgcGxhY2Vob2xkZXI6IFwiQWx0IHRleHRcIiwgdmFsdWU6IGl0ZW0uYWx0VGV4dCwgb25DaGFuZ2U6IChlKSA9PiBlbWl0KGl0ZW1zLm1hcCgoaXQsIGopID0+IGogPT09IGkgPyB7IC4uLml0LCBhbHRUZXh0OiBlLnRhcmdldC52YWx1ZSB9IDogaXQpKSwgc3R5bGU6IHsgd2lkdGg6ICcxMDAlJywgZm9udFNpemU6IDEwLCBwYWRkaW5nOiAnM3B4IDZweCcsIGJvcmRlcjogJ25vbmUnLCBib3JkZXJUb3A6ICcxcHggc29saWQgcmdiYSgxMjgsMTI4LDEyOCwwLjIpJywgYmFja2dyb3VuZDogJ3RyYW5zcGFyZW50JywgYm94U2l6aW5nOiAnYm9yZGVyLWJveCcgfSB9KSxcbiAgICAgICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6ICgpID0+IGVtaXQoaXRlbXMuZmlsdGVyKChfLCBqKSA9PiBqICE9PSBpKSksIHN0eWxlOiB7IHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6IDQsIHJpZ2h0OiA0LCBiYWNrZ3JvdW5kOiAncmdiYSgyMjAsMzgsMzgsMC44KScsIGJvcmRlcjogJ25vbmUnLCBib3JkZXJSYWRpdXM6IDQsIGNvbG9yOiAnI2ZmZicsIGZvbnRTaXplOiAxMCwgY3Vyc29yOiAncG9pbnRlcicsIHBhZGRpbmc6ICcxcHggNXB4JyB9LCB0aXRsZTogXCJSZW1vdmVcIiB9LCBcIlxcdTI3MTVcIikpKSkpKSkpKSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tZWRpYS11cGxvYWRlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3duS2V5cyA9IGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgb3duS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgICB2YXIgYXIgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGsgaW4gbykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBrKSkgYXJbYXIubGVuZ3RoXSA9IGs7XG4gICAgICAgICAgICByZXR1cm4gYXI7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBvd25LZXlzKG8pO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtb2QpIHtcbiAgICAgICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgPSBvd25LZXlzKG1vZCksIGkgPSAwOyBpIDwgay5sZW5ndGg7IGkrKykgaWYgKGtbaV0gIT09IFwiZGVmYXVsdFwiKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGtbaV0pO1xuICAgICAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gVmlkZW9NYW5hZ2VyO1xuY29uc3QgcmVhY3RfMSA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwicmVhY3RcIikpO1xuZnVuY3Rpb24gZGV0ZWN0U291cmNlKHVybCkge1xuICAgIGlmICgveW91dHUoXFwuYmV8YmVcXC5jb20pL2kudGVzdCh1cmwpKVxuICAgICAgICByZXR1cm4gJ3lvdXR1YmUnO1xuICAgIGlmICgvdmltZW9cXC5jb20vaS50ZXN0KHVybCkpXG4gICAgICAgIHJldHVybiAndmltZW8nO1xuICAgIHJldHVybiAnc2VsZl9ob3N0ZWQnO1xufVxuZnVuY3Rpb24gVmlkZW9NYW5hZ2VyKHsgcHJvcGVydHksIHJlY29yZCwgb25DaGFuZ2UgfSkge1xuICAgIGNvbnN0IGluaXRpYWwgPSBbXTtcbiAgICBpZiAocmVjb3JkPy5wYXJhbXMpIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICB3aGlsZSAocmVjb3JkLnBhcmFtc1tgJHtwcm9wZXJ0eS5wYXRofS4ke2l9LnVybGBdKSB7XG4gICAgICAgICAgICBpbml0aWFsLnB1c2goe1xuICAgICAgICAgICAgICAgIGlkOiByZWNvcmQucGFyYW1zW2Ake3Byb3BlcnR5LnBhdGh9LiR7aX0uaWRgXSA/PyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgc291cmNlOiAocmVjb3JkLnBhcmFtc1tgJHtwcm9wZXJ0eS5wYXRofS4ke2l9LnNvdXJjZWBdID8/ICdzZWxmX2hvc3RlZCcpLFxuICAgICAgICAgICAgICAgIHVybDogcmVjb3JkLnBhcmFtc1tgJHtwcm9wZXJ0eS5wYXRofS4ke2l9LnVybGBdLFxuICAgICAgICAgICAgICAgIHRpdGxlOiByZWNvcmQucGFyYW1zW2Ake3Byb3BlcnR5LnBhdGh9LiR7aX0udGl0bGVgXSA/PyAnJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IFtpdGVtcywgc2V0SXRlbXNdID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKGluaXRpYWwpO1xuICAgIGNvbnN0IFtuZXdVcmwsIHNldE5ld1VybF0gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoJycpO1xuICAgIGNvbnN0IFtuZXdUaXRsZSwgc2V0TmV3VGl0bGVdID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKCcnKTtcbiAgICBjb25zdCBkcmFnSWR4ID0gKDAsIHJlYWN0XzEudXNlUmVmKShudWxsKTtcbiAgICBjb25zdCBlbWl0ID0gKDAsIHJlYWN0XzEudXNlQ2FsbGJhY2spKChuZXh0KSA9PiB7XG4gICAgICAgIHNldEl0ZW1zKG5leHQpO1xuICAgICAgICBvbkNoYW5nZShwcm9wZXJ0eS5wYXRoLCBuZXh0KTtcbiAgICB9LCBbb25DaGFuZ2UsIHByb3BlcnR5LnBhdGhdKTtcbiAgICBjb25zdCBhZGRJdGVtID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBuZXdVcmwudHJpbSgpO1xuICAgICAgICBpZiAoIXVybClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgaXRlbSA9IHsgc291cmNlOiBkZXRlY3RTb3VyY2UodXJsKSwgdXJsLCB0aXRsZTogbmV3VGl0bGUudHJpbSgpIH07XG4gICAgICAgIGVtaXQoWy4uLml0ZW1zLCBpdGVtXSk7XG4gICAgICAgIHNldE5ld1VybCgnJyk7XG4gICAgICAgIHNldE5ld1RpdGxlKCcnKTtcbiAgICB9O1xuICAgIGNvbnN0IG9uRHJhZ1N0YXJ0ID0gKGkpID0+IHsgZHJhZ0lkeC5jdXJyZW50ID0gaTsgfTtcbiAgICBjb25zdCBvbkRyYWdPdmVyID0gKGUsIGkpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoZHJhZ0lkeC5jdXJyZW50ID09PSBudWxsIHx8IGRyYWdJZHguY3VycmVudCA9PT0gaSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgbmV4dCA9IFsuLi5pdGVtc107XG4gICAgICAgIGNvbnN0IFttb3ZlZF0gPSBuZXh0LnNwbGljZShkcmFnSWR4LmN1cnJlbnQsIDEpO1xuICAgICAgICBuZXh0LnNwbGljZShpLCAwLCBtb3ZlZCk7XG4gICAgICAgIGRyYWdJZHguY3VycmVudCA9IGk7XG4gICAgICAgIGVtaXQobmV4dCk7XG4gICAgfTtcbiAgICBjb25zdCBsYWJlbFN0eWxlID0ge1xuICAgICAgICBmb250U2l6ZTogMTAsIGZvbnRXZWlnaHQ6IDcwMCwgdGV4dFRyYW5zZm9ybTogJ3VwcGVyY2FzZScsIGxldHRlclNwYWNpbmc6IDEsIG9wYWNpdHk6IDAuNSwgbWFyZ2luQm90dG9tOiA0LFxuICAgIH07XG4gICAgY29uc3QgaW5wdXRTdHlsZSA9IHtcbiAgICAgICAgd2lkdGg6ICcxMDAlJywgcGFkZGluZzogJzZweCAxMHB4JywgYm9yZGVyUmFkaXVzOiA2LCBib3JkZXI6ICcxcHggc29saWQgcmdiYSgxMjgsMTI4LDEyOCwwLjMpJyxcbiAgICAgICAgYmFja2dyb3VuZDogJ3RyYW5zcGFyZW50JywgZm9udFNpemU6IDEzLCBjb2xvcjogJ2luaGVyaXQnLCBib3hTaXppbmc6ICdib3JkZXItYm94JyxcbiAgICB9O1xuICAgIHJldHVybiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6IDEyIH0gfSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogNjAwLCB0ZXh0VHJhbnNmb3JtOiAndXBwZXJjYXNlJywgbGV0dGVyU3BhY2luZzogMSwgb3BhY2l0eTogMC43IH0gfSwgcHJvcGVydHkucGF0aC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHByb3BlcnR5LnBhdGguc2xpY2UoMSkpLFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogNiwgcGFkZGluZzogMTIsIGJvcmRlclJhZGl1czogOCwgYm9yZGVyOiAnMXB4IHNvbGlkIHJnYmEoMTI4LDEyOCwxMjgsMC4yKScgfSB9LFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogbGFiZWxTdHlsZSB9LCBcIkFkZCB2aWRlb1wiKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyB0eXBlOiBcInVybFwiLCBwbGFjZWhvbGRlcjogXCJZb3VUdWJlLCBWaW1lbywgb3IgTVA0IFVSTFwiLCB2YWx1ZTogbmV3VXJsLCBvbkNoYW5nZTogKGUpID0+IHNldE5ld1VybChlLnRhcmdldC52YWx1ZSksIG9uS2V5RG93bjogKGUpID0+IGUua2V5ID09PSAnRW50ZXInICYmIGFkZEl0ZW0oKSwgc3R5bGU6IGlucHV0U3R5bGUgfSksXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgdHlwZTogXCJ0ZXh0XCIsIHBsYWNlaG9sZGVyOiBcIlRpdGxlIChvcHRpb25hbClcIiwgdmFsdWU6IG5ld1RpdGxlLCBvbkNoYW5nZTogKGUpID0+IHNldE5ld1RpdGxlKGUudGFyZ2V0LnZhbHVlKSwgb25LZXlEb3duOiAoZSkgPT4gZS5rZXkgPT09ICdFbnRlcicgJiYgYWRkSXRlbSgpLCBzdHlsZTogaW5wdXRTdHlsZSB9KSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHsgb25DbGljazogYWRkSXRlbSwgc3R5bGU6IHsgYWxpZ25TZWxmOiAnZmxleC1zdGFydCcsIHBhZGRpbmc6ICc2cHggMTRweCcsIGJvcmRlclJhZGl1czogNiwgYm9yZGVyOiAnbm9uZScsIGN1cnNvcjogJ3BvaW50ZXInLCBiYWNrZ3JvdW5kOiAnIzYzNjZmMScsIGNvbG9yOiAnI2ZmZicsIGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogNjAwIH0gfSwgXCIrIEFkZFwiKSksXG4gICAgICAgIGl0ZW1zLmxlbmd0aCA+IDAgJiYgKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiA2IH0gfSwgaXRlbXMubWFwKChpdGVtLCBpKSA9PiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBrZXk6IGksIGRyYWdnYWJsZTogdHJ1ZSwgb25EcmFnU3RhcnQ6ICgpID0+IG9uRHJhZ1N0YXJ0KGkpLCBvbkRyYWdPdmVyOiAoZSkgPT4gb25EcmFnT3ZlcihlLCBpKSwgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6IDgsXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzhweCAxMHB4JywgYm9yZGVyUmFkaXVzOiA4LFxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCByZ2JhKDEyOCwxMjgsMTI4LDAuMiknLFxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ2dyYWInLFxuICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHsgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDksIHBhZGRpbmc6ICcycHggNnB4JywgYm9yZGVyUmFkaXVzOiA0LCBmb250V2VpZ2h0OiA3MDAsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IGl0ZW0uc291cmNlID09PSAneW91dHViZScgPyAncmdiYSgyMjAsMzgsMzgsMC4xNSknXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGl0ZW0uc291cmNlID09PSAndmltZW8nID8gJ3JnYmEoMTQsMTY1LDIzMywwLjE1KScgOiAncmdiYSg5OSwxMDIsMjQxLDAuMTUpJyxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGl0ZW0uc291cmNlID09PSAneW91dHViZScgPyAnI2RjMjYyNidcbiAgICAgICAgICAgICAgICAgICAgICAgIDogaXRlbS5zb3VyY2UgPT09ICd2aW1lbycgPyAnIzBlYTVlOScgOiAnIzYzNjZmMScsXG4gICAgICAgICAgICAgICAgICAgIHRleHRUcmFuc2Zvcm06ICd1cHBlcmNhc2UnLCBsZXR0ZXJTcGFjaW5nOiAxLCBmbGV4U2hyaW5rOiAwLFxuICAgICAgICAgICAgICAgIH0gfSwgaXRlbS5zb3VyY2UucmVwbGFjZSgnXycsICcgJykpLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBmbGV4OiAxLCBvdmVyZmxvdzogJ2hpZGRlbicgfSB9LFxuICAgICAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiA1MDAsIHdoaXRlU3BhY2U6ICdub3dyYXAnLCBvdmVyZmxvdzogJ2hpZGRlbicsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJyB9IH0sIGl0ZW0udGl0bGUgfHwgaXRlbS51cmwpLFxuICAgICAgICAgICAgICAgIGl0ZW0udGl0bGUgJiYgKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZm9udFNpemU6IDEwLCBvcGFjaXR5OiAwLjUsIHdoaXRlU3BhY2U6ICdub3dyYXAnLCBvdmVyZmxvdzogJ2hpZGRlbicsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJyB9IH0sIGl0ZW0udXJsKSkpLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7IHR5cGU6IFwidGV4dFwiLCBwbGFjZWhvbGRlcjogXCJUaXRsZVwiLCB2YWx1ZTogaXRlbS50aXRsZSwgb25DaGFuZ2U6IChlKSA9PiBlbWl0KGl0ZW1zLm1hcCgoaXQsIGopID0+IGogPT09IGkgPyB7IC4uLml0LCB0aXRsZTogZS50YXJnZXQudmFsdWUgfSA6IGl0KSksIHN0eWxlOiB7IC4uLmlucHV0U3R5bGUsIHdpZHRoOiAxMjAsIGZsZXhTaHJpbms6IDAgfSB9KSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHsgb25DbGljazogKCkgPT4gZW1pdChpdGVtcy5maWx0ZXIoKF8sIGopID0+IGogIT09IGkpKSwgc3R5bGU6IHsgZmxleFNocmluazogMCwgYmFja2dyb3VuZDogJ3JnYmEoMjIwLDM4LDM4LDAuMTUpJywgYm9yZGVyOiAnbm9uZScsIGJvcmRlclJhZGl1czogNCwgY29sb3I6ICcjZGMyNjI2JywgZm9udFNpemU6IDExLCBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzNweCA3cHgnIH0gfSwgXCJcXHUyNzE1XCIpLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHsgc3R5bGU6IHsgZmxleFNocmluazogMCwgb3BhY2l0eTogMC4zLCBmb250U2l6ZTogMTQsIGN1cnNvcjogJ2dyYWInIH0gfSwgXCJcXHUyODNGXCIpKSkpKSkpKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXZpZGVvLW1hbmFnZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcbiAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19zZXRNb2R1bGVEZWZhdWx0KSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xufSkgOiBmdW5jdGlvbihvLCB2KSB7XG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xufSk7XG52YXIgX19pbXBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydFN0YXIpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG93bktleXMgPSBmdW5jdGlvbihvKSB7XG4gICAgICAgIG93bktleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgdmFyIGFyID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBrIGluIG8pIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobywgaykpIGFyW2FyLmxlbmd0aF0gPSBrO1xuICAgICAgICAgICAgcmV0dXJuIGFyO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gb3duS2V5cyhvKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAobW9kKSB7XG4gICAgICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrID0gb3duS2V5cyhtb2QpLCBpID0gMDsgaSA8IGsubGVuZ3RoOyBpKyspIGlmIChrW2ldICE9PSBcImRlZmF1bHRcIikgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrW2ldKTtcbiAgICAgICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xufSkoKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IFBob3RvVXBsb2FkZXI7XG5jb25zdCByZWFjdF8xID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5mdW5jdGlvbiBQaG90b1VwbG9hZGVyKHsgcHJvcGVydHksIHJlY29yZCwgb25DaGFuZ2UgfSkge1xuICAgIGNvbnN0IGFwaUJhc2UgPSB3aW5kb3cuX19BUElfQkFTRV9fXG4gICAgICAgID8/IGAke3dpbmRvdy5sb2NhdGlvbi5wcm90b2NvbH0vLyR7d2luZG93LmxvY2F0aW9uLmhvc3RuYW1lfTozMDAxYDtcbiAgICBjb25zdCBleGlzdGluZ1VybCA9IHJlY29yZD8ucGFyYW1zPy5bcHJvcGVydHkucGF0aF0gPz8gJyc7XG4gICAgY29uc3QgW2l0ZW1zLCBzZXRJdGVtc10gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoW10pO1xuICAgIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKGZhbHNlKTtcbiAgICBjb25zdCBmaWxlUmVmID0gKDAsIHJlYWN0XzEudXNlUmVmKShudWxsKTtcbiAgICBjb25zdCB1cGRhdGUgPSAoMCwgcmVhY3RfMS51c2VDYWxsYmFjaykoKGlkeCwgcGF0Y2gpID0+IHNldEl0ZW1zKHByZXYgPT4gcHJldi5tYXAoKGl0LCBpKSA9PiBpID09PSBpZHggPyB7IC4uLml0LCAuLi5wYXRjaCB9IDogaXQpKSwgW10pO1xuICAgIGNvbnN0IHVwbG9hZE9uZSA9ICgwLCByZWFjdF8xLnVzZUNhbGxiYWNrKShhc3luYyAoaXRlbSwgaWR4KSA9PiB7XG4gICAgICAgIHVwZGF0ZShpZHgsIHsgc3RhdGU6ICd1cGxvYWRpbmcnLCBwcm9ncmVzczogMCB9KTtcbiAgICAgICAgY29uc3QgZmQgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgICAgZmQuYXBwZW5kKCdmaWxlJywgaXRlbS5maWxlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlKGlkeCwgeyBwcm9ncmVzczogTWF0aC5yb3VuZCgoZS5sb2FkZWQgLyBlLnRvdGFsKSAqIDkwKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGUoaWR4LCB7IHN0YXRlOiAnZG9uZScsIHByb2dyZXNzOiAxMDAsIHJlc3VsdFVybDogZGF0YS5vcmlnaW5hbFVybCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZShwcm9wZXJ0eS5wYXRoLCBkYXRhLm9yaWdpbmFsVXJsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignSW52YWxpZCBKU09OIHJlc3BvbnNlJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgVXBsb2FkIGZhaWxlZDogSFRUUCAke3hoci5zdGF0dXN9YCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKCkgPT4gcmVqZWN0KG5ldyBFcnJvcignTmV0d29yayBlcnJvcicpKSk7XG4gICAgICAgICAgICAgICAgeGhyLm9wZW4oJ1BPU1QnLCBgJHthcGlCYXNlfS92MS9nYWxsZXJ5L3Bob3Rvcy91cGxvYWRgKTtcbiAgICAgICAgICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB4aHIuc2VuZChmZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB1cGRhdGUoaWR4LCB7IHN0YXRlOiAnZXJyb3InLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbYXBpQmFzZSwgb25DaGFuZ2UsIHByb3BlcnR5LnBhdGgsIHVwZGF0ZV0pO1xuICAgIGNvbnN0IGFkZEZpbGVzID0gKDAsIHJlYWN0XzEudXNlQ2FsbGJhY2spKChmaWxlTGlzdCkgPT4ge1xuICAgICAgICBpZiAoIWZpbGVMaXN0KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBhbGxvd2VkID0gTWF0aC5taW4oZmlsZUxpc3QubGVuZ3RoLCA1MCAtIGl0ZW1zLmxlbmd0aCk7XG4gICAgICAgIGNvbnN0IG5ld0l0ZW1zID0gQXJyYXkuZnJvbShmaWxlTGlzdCkuc2xpY2UoMCwgYWxsb3dlZCkubWFwKGYgPT4gKHtcbiAgICAgICAgICAgIGZpbGU6IGYsXG4gICAgICAgICAgICBsb2NhbFVybDogVVJMLmNyZWF0ZU9iamVjdFVSTChmKSxcbiAgICAgICAgICAgIHN0YXRlOiAncGVuZGluZycsXG4gICAgICAgICAgICBwcm9ncmVzczogMCxcbiAgICAgICAgfSkpO1xuICAgICAgICBzZXRJdGVtcyhwcmV2ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5leHQgPSBbLi4ucHJldiwgLi4ubmV3SXRlbXNdO1xuICAgICAgICAgICAgbmV3SXRlbXMuZm9yRWFjaCgoaXQsIGkpID0+IHZvaWQgdXBsb2FkT25lKGl0LCBwcmV2Lmxlbmd0aCArIGkpKTtcbiAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9KTtcbiAgICB9LCBbaXRlbXMubGVuZ3RoLCB1cGxvYWRPbmVdKTtcbiAgICBjb25zdCBzdGF0ZUNvbG9yID0ge1xuICAgICAgICBwZW5kaW5nOiAnIzZiNzI4MCcsXG4gICAgICAgIHVwbG9hZGluZzogJyM2MzY2ZjEnLFxuICAgICAgICBkb25lOiAnIzIyYzU1ZScsXG4gICAgICAgIGVycm9yOiAnI2VmNDQ0NCcsXG4gICAgfTtcbiAgICByZXR1cm4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAxMiB9IH0sXG4gICAgICAgIGV4aXN0aW5nVXJsICYmIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImltZ1wiLCB7IHNyYzogZXhpc3RpbmdVcmwsIGFsdDogXCJDdXJyZW50XCIsIHN0eWxlOiB7IHdpZHRoOiAxMjAsIGhlaWdodDogODAsIG9iamVjdEZpdDogJ2NvdmVyJywgYm9yZGVyUmFkaXVzOiA2LCBib3JkZXI6ICcxcHggc29saWQgcmdiYSgxMjgsMTI4LDEyOCwwLjIpJyB9IH0pKSxcbiAgICAgICAgaXRlbXMubGVuZ3RoIDwgNTAgJiYgKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgb25EcmFnT3ZlcjogZSA9PiB7IGUucHJldmVudERlZmF1bHQoKTsgc2V0RHJhZ2dpbmcodHJ1ZSk7IH0sIG9uRHJhZ0xlYXZlOiAoKSA9PiBzZXREcmFnZ2luZyhmYWxzZSksIG9uRHJvcDogZSA9PiB7IGUucHJldmVudERlZmF1bHQoKTsgc2V0RHJhZ2dpbmcoZmFsc2UpOyBhZGRGaWxlcyhlLmRhdGFUcmFuc2Zlci5maWxlcyk7IH0sIG9uQ2xpY2s6ICgpID0+IGZpbGVSZWYuY3VycmVudD8uY2xpY2soKSwgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICBib3JkZXI6IGAycHggZGFzaGVkICR7ZHJhZ2dpbmcgPyAnIzgxOGNmOCcgOiAncmdiYSgxMjgsMTI4LDEyOCwwLjMpJ31gLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogOCwgcGFkZGluZzogJzIwcHggMTZweCcsIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsIGJhY2tncm91bmQ6IGRyYWdnaW5nID8gJ3JnYmEoOTksMTAyLDI0MSwwLjA1KScgOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHsgc3R5bGU6IHsgZm9udFNpemU6IDEzLCBvcGFjaXR5OiAwLjcgfSB9LFxuICAgICAgICAgICAgICAgIFwiRHJvcCBwaG90b3MgaGVyZSBvciBcIixcbiAgICAgICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInN0cm9uZ1wiLCBudWxsLCBcImNsaWNrIHRvIGJyb3dzZVwiKSxcbiAgICAgICAgICAgICAgICBcIiAobWF4IDUwKVwiKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyByZWY6IGZpbGVSZWYsIHR5cGU6IFwiZmlsZVwiLCBtdWx0aXBsZTogdHJ1ZSwgYWNjZXB0OiBcImltYWdlL2pwZWcsaW1hZ2UvcG5nLGltYWdlL3dlYnAsaW1hZ2UvZ2lmXCIsIHN0eWxlOiB7IGRpc3BsYXk6ICdub25lJyB9LCBvbkNoYW5nZTogZSA9PiBhZGRGaWxlcyhlLnRhcmdldC5maWxlcykgfSkpKSxcbiAgICAgICAgaXRlbXMubGVuZ3RoID4gMCAmJiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6IDggfSB9LCBpdGVtcy5tYXAoKGl0ZW0sIGkpID0+IChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IGtleTogaSwgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAxMCB9IH0sXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImltZ1wiLCB7IHNyYzogaXRlbS5yZXN1bHRVcmwgPz8gaXRlbS5sb2NhbFVybCwgYWx0OiBpdGVtLmZpbGUubmFtZSwgc3R5bGU6IHsgd2lkdGg6IDQ4LCBoZWlnaHQ6IDM2LCBvYmplY3RGaXQ6ICdjb3ZlcicsIGJvcmRlclJhZGl1czogNCwgZmxleFNocmluazogMCB9IH0pLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBmbGV4OiAxLCBtaW5XaWR0aDogMCB9IH0sXG4gICAgICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTEsIG9wYWNpdHk6IDAuOCwgd2hpdGVTcGFjZTogJ25vd3JhcCcsIG92ZXJmbG93OiAnaGlkZGVuJywgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnIH0gfSwgaXRlbS5maWxlLm5hbWUpLFxuICAgICAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgaGVpZ2h0OiA0LCBib3JkZXJSYWRpdXM6IDIsIGJhY2tncm91bmQ6ICdyZ2JhKDEyOCwxMjgsMTI4LDAuMiknLCBtYXJnaW5Ub3A6IDQgfSB9LFxuICAgICAgICAgICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsIGJvcmRlclJhZGl1czogMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYCR7aXRlbS5wcm9ncmVzc30lYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBzdGF0ZUNvbG9yW2l0ZW0uc3RhdGVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICd3aWR0aCAwLjE1cyBlYXNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSkpLFxuICAgICAgICAgICAgICAgIGl0ZW0uZXJyb3IgJiYgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTAsIGNvbG9yOiAnI2VmNDQ0NCcsIG1hcmdpblRvcDogMiB9IH0sIGl0ZW0uZXJyb3IpKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMCwgY29sb3I6IHN0YXRlQ29sb3JbaXRlbS5zdGF0ZV0sIGZsZXhTaHJpbms6IDAgfSB9LCBpdGVtLnN0YXRlID09PSAndXBsb2FkaW5nJyA/IGAke2l0ZW0ucHJvZ3Jlc3N9JWAgOiBpdGVtLnN0YXRlKSkpKSkpKSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1waG90by11cGxvYWRlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3duS2V5cyA9IGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgb3duS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgICB2YXIgYXIgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGsgaW4gbykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBrKSkgYXJbYXIubGVuZ3RoXSA9IGs7XG4gICAgICAgICAgICByZXR1cm4gYXI7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBvd25LZXlzKG8pO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtb2QpIHtcbiAgICAgICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgPSBvd25LZXlzKG1vZCksIGkgPSAwOyBpIDwgay5sZW5ndGg7IGkrKykgaWYgKGtbaV0gIT09IFwiZGVmYXVsdFwiKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGtbaV0pO1xuICAgICAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgcmVhY3RfMSA9IF9faW1wb3J0U3RhcihyZXF1aXJlKFwicmVhY3RcIikpO1xuY29uc3QgYWRtaW5qc18xID0gcmVxdWlyZShcImFkbWluanNcIik7XG5jb25zdCBJTklUSUFMID0ge1xuICAgIHB1Ymxpc2hlZFBvc3RzOiAn4oCTJyxcbiAgICBkcmFmdFBvc3RzOiAn4oCTJyxcbiAgICBwcm9qZWN0czogJ+KAkycsXG4gICAgcGhvdG9zOiAn4oCTJyxcbiAgICBhbGJ1bXM6ICfigJMnLFxufTtcbmNvbnN0IENBUkRTID0gW1xuICAgIHsga2V5OiAncHVibGlzaGVkUG9zdHMnLCBsYWJlbDogJ1B1Ymxpc2hlZCBQb3N0cycsIGljb246ICfwn5OdJywgYWNjZW50OiAnIzYzNjZmMScgfSxcbiAgICB7IGtleTogJ2RyYWZ0UG9zdHMnLCBsYWJlbDogJ0RyYWZ0IFBvc3RzJywgaWNvbjogJ+Kcj++4jycsIGFjY2VudDogJyNmNTllMGInIH0sXG4gICAgeyBrZXk6ICdwcm9qZWN0cycsIGxhYmVsOiAnUHJvamVjdHMnLCBpY29uOiAn8J+agCcsIGFjY2VudDogJyMyMmM1NWUnIH0sXG4gICAgeyBrZXk6ICdwaG90b3MnLCBsYWJlbDogJ1Bob3RvcycsIGljb246ICfwn5O3JywgYWNjZW50OiAnIzNiODJmNicgfSxcbiAgICB7IGtleTogJ2FsYnVtcycsIGxhYmVsOiAnQWxidW1zJywgaWNvbjogJ/Cfl4LvuI8nLCBhY2NlbnQ6ICcjYTg1NWY3JyB9LFxuXTtcbmNvbnN0IERhc2hib2FyZCA9ICgpID0+IHtcbiAgICBjb25zdCBbc3RhdHMsIHNldFN0YXRzXSA9ICgwLCByZWFjdF8xLnVzZVN0YXRlKShJTklUSUFMKTtcbiAgICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkodHJ1ZSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkobnVsbCk7XG4gICAgKDAsIHJlYWN0XzEudXNlRWZmZWN0KSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFwaSA9IG5ldyBhZG1pbmpzXzEuQXBpQ2xpZW50KCk7XG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIGxvYWQoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtwdWJQb3N0c1JlcywgYWxsUG9zdHNSZXMsIHByb2plY3RzUmVzLCBwaG90b3NSZXMsIGFsYnVtc1Jlc10gPSBhd2FpdCBQcm9taXNlLmFsbFNldHRsZWQoW1xuICAgICAgICAgICAgICAgICAgICBmZXRjaCgnL3YxL2Jsb2cnLCB7IGNyZWRlbnRpYWxzOiAnaW5jbHVkZScgfSkudGhlbihyID0+IHIuanNvbigpKSxcbiAgICAgICAgICAgICAgICAgICAgYXBpLnJlc291cmNlQWN0aW9uKHsgcmVzb3VyY2VJZDogJ0Jsb2dQb3N0JywgYWN0aW9uTmFtZTogJ2xpc3QnLCBwYXJhbXM6IHsgcGVyUGFnZTogMSB9IH0pLFxuICAgICAgICAgICAgICAgICAgICBmZXRjaCgnL3YxL3Byb2plY3RzJywgeyBjcmVkZW50aWFsczogJ2luY2x1ZGUnIH0pLnRoZW4ociA9PiByLmpzb24oKSksXG4gICAgICAgICAgICAgICAgICAgIGZldGNoKCcvdjEvZ2FsbGVyeS9waG90b3MnLCB7IGNyZWRlbnRpYWxzOiAnaW5jbHVkZScgfSkudGhlbihyID0+IHIuanNvbigpKSxcbiAgICAgICAgICAgICAgICAgICAgZmV0Y2goJy92MS9nYWxsZXJ5L2FsYnVtcycsIHsgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyB9KS50aGVuKHIgPT4gci5qc29uKCkpLFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHB1Ymxpc2hlZFBvc3RzID0gcHViUG9zdHNSZXMuc3RhdHVzID09PSAnZnVsZmlsbGVkJyA/IHB1YlBvc3RzUmVzLnZhbHVlLmxlbmd0aCA6ICfigJMnO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvdGFsUG9zdHMgPSBhbGxQb3N0c1Jlcy5zdGF0dXMgPT09ICdmdWxmaWxsZWQnXG4gICAgICAgICAgICAgICAgICAgID8gKGFsbFBvc3RzUmVzLnZhbHVlPy5kYXRhPy5tZXRhPy50b3RhbCA/PyAn4oCTJylcbiAgICAgICAgICAgICAgICAgICAgOiAn4oCTJztcbiAgICAgICAgICAgICAgICBjb25zdCBkcmFmdFBvc3RzID0gdHlwZW9mIHRvdGFsUG9zdHMgPT09ICdudW1iZXInICYmIHR5cGVvZiBwdWJsaXNoZWRQb3N0cyA9PT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgPyB0b3RhbFBvc3RzIC0gcHVibGlzaGVkUG9zdHNcbiAgICAgICAgICAgICAgICAgICAgOiAn4oCTJztcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9qZWN0cyA9IHByb2plY3RzUmVzLnN0YXR1cyA9PT0gJ2Z1bGZpbGxlZCcgPyBwcm9qZWN0c1Jlcy52YWx1ZS5sZW5ndGggOiAn4oCTJztcbiAgICAgICAgICAgICAgICBjb25zdCBwaG90b3MgPSBwaG90b3NSZXMuc3RhdHVzID09PSAnZnVsZmlsbGVkJ1xuICAgICAgICAgICAgICAgICAgICA/IChwaG90b3NSZXMudmFsdWU/LnRvdGFsID8/ICfigJMnKVxuICAgICAgICAgICAgICAgICAgICA6ICfigJMnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFsYnVtcyA9IGFsYnVtc1Jlcy5zdGF0dXMgPT09ICdmdWxmaWxsZWQnID8gYWxidW1zUmVzLnZhbHVlLmxlbmd0aCA6ICfigJMnO1xuICAgICAgICAgICAgICAgIHNldFN0YXRzKHsgcHVibGlzaGVkUG9zdHMsIGRyYWZ0UG9zdHMsIHByb2plY3RzLCBwaG90b3MsIGFsYnVtcyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgc2V0RXJyb3IoZT8ubWVzc2FnZSA/PyAnRmFpbGVkIHRvIGxvYWQgc3RhdHMnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZvaWQgbG9hZCgpO1xuICAgIH0sIFtdKTtcbiAgICBjb25zdCBob3VyID0gbmV3IERhdGUoKS5nZXRIb3VycygpO1xuICAgIGNvbnN0IGdyZWV0aW5nID0gaG91ciA8IDEyID8gJ0dvb2QgbW9ybmluZycgOiBob3VyIDwgMTggPyAnR29vZCBhZnRlcm5vb24nIDogJ0dvb2QgZXZlbmluZyc7XG4gICAgcmV0dXJuIChyZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IHBhZGRpbmc6ICczMnB4JywgZm9udEZhbWlseTogJ3N5c3RlbS11aSwgc2Fucy1zZXJpZicgfSB9LFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IG1hcmdpbkJvdHRvbTogJzMycHgnIH0gfSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiaDFcIiwgeyBzdHlsZTogeyBmb250U2l6ZTogJzI4cHgnLCBmb250V2VpZ2h0OiA3MDAsIG1hcmdpbjogMCwgY29sb3I6ICcjZTJlOGYwJyB9IH0sXG4gICAgICAgICAgICAgICAgZ3JlZXRpbmcsXG4gICAgICAgICAgICAgICAgXCIgXFx1RDgzRFxcdURDNEJcIiksXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcInBcIiwgeyBzdHlsZTogeyBjb2xvcjogJyM5NGEzYjgnLCBtYXJnaW5Ub3A6ICc2cHgnLCBmb250U2l6ZTogJzE1cHgnIH0gfSwgXCJIZXJlJ3MgYSBsaXZlIHNuYXBzaG90IG9mIHlvdXIgcG9ydGZvbGlvIGNvbnRlbnQuXCIpKSxcbiAgICAgICAgZXJyb3IgJiYgKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgcGFkZGluZzogJzEycHggMTZweCcsIGJhY2tncm91bmQ6ICdyZ2JhKDIzOSw2OCw2OCwwLjE1KScsIGJvcmRlcjogJzFweCBzb2xpZCByZ2JhKDIzOSw2OCw2OCwwLjQpJywgYm9yZGVyUmFkaXVzOiAnOHB4JywgY29sb3I6ICcjZmNhNWE1JywgbWFyZ2luQm90dG9tOiAnMjRweCcsIGZvbnRTaXplOiAnMTRweCcgfSB9LFxuICAgICAgICAgICAgXCJcXHUyNkEwXFx1RkUwRiBcIixcbiAgICAgICAgICAgIGVycm9yKSksXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2dyaWQnLCBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZmlsbCwgbWlubWF4KDIwMHB4LCAxZnIpKScsIGdhcDogJzIwcHgnIH0gfSwgQ0FSRFMubWFwKCh7IGtleSwgbGFiZWwsIGljb24sIGFjY2VudCB9KSA9PiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBrZXk6IGtleSwgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAncmdiYSgzMCw0MSw1OSwwLjgpJyxcbiAgICAgICAgICAgICAgICBib3JkZXI6IGAxcHggc29saWQgJHthY2NlbnR9NDBgLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyNHB4JyxcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6IGAwIDAgMCAxcHggJHthY2NlbnR9MjAsIDAgNHB4IDI0cHggcmdiYSgwLDAsMCwwLjMpYCxcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAndHJhbnNmb3JtIDE1MG1zJyxcbiAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZm9udFNpemU6ICcyOHB4JywgbWFyZ2luQm90dG9tOiAnMTJweCcsIGxpbmVIZWlnaHQ6IDEgfSB9LCBpY29uKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICczNnB4JyxcbiAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogNzAwLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogbG9hZGluZyA/ICcjNGI1NTYzJyA6IGFjY2VudCxcbiAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodDogMSxcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnNnB4JyxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2NvbG9yIDMwMG1zJyxcbiAgICAgICAgICAgICAgICB9IH0sIGxvYWRpbmcgPyAn4oCUJyA6IFN0cmluZyhzdGF0c1trZXldKSksXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IHN0eWxlOiB7IGNvbG9yOiAnIzk0YTNiOCcsIGZvbnRTaXplOiAnMTNweCcsIGZvbnRXZWlnaHQ6IDUwMCwgbGV0dGVyU3BhY2luZzogJzAuMDI1ZW0nIH0gfSwgbGFiZWwpKSkpKSxcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBzdHlsZTogeyBtYXJnaW5Ub3A6ICc0MHB4JyB9IH0sXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcImgyXCIsIHsgc3R5bGU6IHsgZm9udFNpemU6ICcxNnB4JywgZm9udFdlaWdodDogNjAwLCBjb2xvcjogJyNjYmQ1ZTEnLCBtYXJnaW5Cb3R0b206ICcxNnB4JyB9IH0sIFwiUXVpY2sgYWN0aW9uc1wiKSxcbiAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICcxMnB4JywgZmxleFdyYXA6ICd3cmFwJyB9IH0sIFtcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnKyBOZXcgQmxvZyBQb3N0JywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvQmxvZ1Bvc3QvYWN0aW9ucy9uZXcnLCBjb2xvcjogJyM2MzY2ZjEnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJysgTmV3IFByb2plY3QnLCBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9Qcm9qZWN0L2FjdGlvbnMvbmV3JywgY29sb3I6ICcjMjJjNTVlJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICcrIE5ldyBBbGJ1bScsIGhyZWY6ICcvYWRtaW4vcmVzb3VyY2VzL0FsYnVtL2FjdGlvbnMvbmV3JywgY29sb3I6ICcjYTg1NWY3JyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICcrIFVwbG9hZCBQaG90b3MnLCBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9QaG90by9hY3Rpb25zL25ldycsIGNvbG9yOiAnIzNiODJmNicgfSxcbiAgICAgICAgICAgIF0ubWFwKCh7IGxhYmVsLCBocmVmLCBjb2xvciB9KSA9PiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXCJhXCIsIHsga2V5OiBocmVmLCBocmVmOiBocmVmLCBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzlweCAxOHB4JyxcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogYCR7Y29sb3J9MjBgLFxuICAgICAgICAgICAgICAgICAgICBib3JkZXI6IGAxcHggc29saWQgJHtjb2xvcn02MGAsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzhweCcsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzEzcHgnLFxuICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiA2MDAsXG4gICAgICAgICAgICAgICAgICAgIHRleHREZWNvcmF0aW9uOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdiYWNrZ3JvdW5kIDE1MG1zJyxcbiAgICAgICAgICAgICAgICB9IH0sIGxhYmVsKSkpKSksXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFwicFwiLCB7IHN0eWxlOiB7IGNvbG9yOiAnIzQ3NTU2OScsIGZvbnRTaXplOiAnMTJweCcsIG1hcmdpblRvcDogJzMycHgnIH0gfSxcbiAgICAgICAgICAgIFwiU3RhdHMgbG9hZGVkIGF0IFwiLFxuICAgICAgICAgICAgbmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKSkpKTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBEYXNoYm9hcmQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXNoYm9hcmQuanMubWFwIiwiQWRtaW5KUy5Vc2VyQ29tcG9uZW50cyA9IHt9XG5pbXBvcnQgTWFya2Rvd25FZGl0b3IgZnJvbSAnLi4vZGlzdC9zcmMvYWRtaW4vY29tcG9uZW50cy9tYXJrZG93bi1lZGl0b3InXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLk1hcmtkb3duRWRpdG9yID0gTWFya2Rvd25FZGl0b3JcbmltcG9ydCBUYWdQaWNrZXIgZnJvbSAnLi4vZGlzdC9zcmMvYWRtaW4vY29tcG9uZW50cy90YWctcGlja2VyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5UYWdQaWNrZXIgPSBUYWdQaWNrZXJcbmltcG9ydCBTa2lsbFBpY2tlciBmcm9tICcuLi9kaXN0L3NyYy9hZG1pbi9jb21wb25lbnRzL3NraWxsLXBpY2tlcidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuU2tpbGxQaWNrZXIgPSBTa2lsbFBpY2tlclxuaW1wb3J0IE1lZGlhVXBsb2FkZXIgZnJvbSAnLi4vZGlzdC9zcmMvYWRtaW4vY29tcG9uZW50cy9tZWRpYS11cGxvYWRlcidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuTWVkaWFVcGxvYWRlciA9IE1lZGlhVXBsb2FkZXJcbmltcG9ydCBWaWRlb01hbmFnZXIgZnJvbSAnLi4vZGlzdC9zcmMvYWRtaW4vY29tcG9uZW50cy92aWRlby1tYW5hZ2VyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5WaWRlb01hbmFnZXIgPSBWaWRlb01hbmFnZXJcbmltcG9ydCBQaG90b1VwbG9hZGVyIGZyb20gJy4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvcGhvdG8tdXBsb2FkZXInXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlBob3RvVXBsb2FkZXIgPSBQaG90b1VwbG9hZGVyXG5pbXBvcnQgRGFzaGJvYXJkIGZyb20gJy4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvZGFzaGJvYXJkJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5EYXNoYm9hcmQgPSBEYXNoYm9hcmQiXSwibmFtZXMiOlsicmVzdWx0IiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJtYXJrZG93bkVkaXRvciIsInZhbHVlIiwicmVhY3RfMSIsIl9faW1wb3J0U3RhciIsInJlcXVpcmUkJDAiLCJlc2MiLCJzIiwicmVwbGFjZSIsInJlbmRlck1hcmtkb3duIiwicmF3Iiwic2F2ZWQiLCJfIiwibGFuZyIsImNvZGUiLCJwdXNoIiwidHJpbSIsImxlbmd0aCIsImMiLCJsaW5lcyIsInNwbGl0Iiwib3V0IiwibGlzdFR5cGUiLCJmbHVzaExpc3QiLCJsaXN0QnVmIiwiam9pbiIsImxpbmUiLCJoIiwibWF0Y2giLCJicSIsInRlc3QiLCJ1bG0iLCJvbG0iLCJ0eXBlIiwic2VjdGlvbnMiLCJtYXAiLCJzZWMiLCJ0Iiwic3RhcnRzV2l0aCIsImZvckVhY2giLCJibGsiLCJpIiwiTWFya2Rvd25FZGl0b3IiLCJwcm9wZXJ0eSIsInJlY29yZCIsIm9uQ2hhbmdlIiwiZmllbGRQYXRoIiwicGF0aCIsImluaXRpYWxWYWx1ZSIsInBhcmFtcyIsInNldFZhbHVlIiwidXNlU3RhdGUiLCJwcmV2aWV3Iiwic2V0UHJldmlldyIsInVwbG9hZGluZyIsInNldFVwbG9hZGluZyIsImFjdGl2ZVRhYiIsInNldEFjdGl2ZVRhYiIsInRleHRhcmVhUmVmIiwidXNlUmVmIiwiZmlsZUlucHV0UmVmIiwiZGVib3VuY2VSZWYiLCJ1c2VFZmZlY3QiLCJ2IiwiaWQiLCJoYW5kbGVDaGFuZ2UiLCJ1c2VDYWxsYmFjayIsImUiLCJ0YXJnZXQiLCJjdXJyZW50IiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsImluc2VydEF0Q3Vyc29yIiwidGV4dCIsInRhIiwic3RhcnQiLCJzZWxlY3Rpb25TdGFydCIsImVuZCIsIm5leHQiLCJzbGljZSIsInNlbGVjdGlvbkVuZCIsImhhbmRsZVVwbG9hZCIsImZpbGUiLCJmZCIsIkZvcm1EYXRhIiwiYXBwZW5kIiwicmVzIiwiZmV0Y2giLCJtZXRob2QiLCJib2R5IiwiY3JlZGVudGlhbHMiLCJvayIsInVybCIsImpzb24iLCJuYW1lIiwiZXJyIiwiYWxlcnQiLCJtZXNzYWdlIiwiZWRpdG9yU3R5bGUiLCJmbGV4IiwiZm9udEZhbWlseSIsImZvbnRTaXplIiwibGluZUhlaWdodCIsInBhZGRpbmciLCJib3JkZXIiLCJib3JkZXJSYWRpdXMiLCJyZXNpemUiLCJiYWNrZ3JvdW5kIiwiY29sb3IiLCJtaW5IZWlnaHQiLCJib3hTaXppbmciLCJvdmVyZmxvd1kiLCJwcmV2aWV3U3R5bGUiLCJ0YWJCdG4iLCJhY3RpdmUiLCJmb250V2VpZ2h0IiwiY3Vyc29yIiwiZGVmYXVsdCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsImRpc3BsYXkiLCJmbGV4RGlyZWN0aW9uIiwiZ2FwIiwiYWxpZ25JdGVtcyIsImZsZXhXcmFwIiwia2V5Iiwib25DbGljayIsImxhYmVsIiwidGl0bGUiLCJpbnNlcnQiLCJfX3NldE1vZHVsZURlZmF1bHQiLCJtb2QiLCJ0YWdQaWNrZXIiLCJ0aGlzIiwiYWRtaW5qc18xIiwicmVxdWlyZSQkMSIsImFwaSIsIkFwaUNsaWVudCIsIlRhZ1BpY2tlciIsImFsbFRhZ3MiLCJzZXRBbGxUYWdzIiwic2VsZWN0ZWQiLCJzZXRTZWxlY3RlZCIsInNldFF1ZXJ5Iiwic2V0U2hvd0Ryb3Bkb3duIiwidGhlbiIsInIiLCJ0YWdzIiwiY2F0Y2giLCJwb3B1bGF0ZWQiLCJmaWx0ZXIiLCJhZGRUYWciLCJ0YWciLCJlbWl0IiwicmVtb3ZlVGFnIiwiY3JlYXRlVGFnIiwicXVlcnkiLCJ0b0xvd2VyQ2FzZSIsImV4aXN0aW5nIiwiZmluZCIsInJlc291cmNlQWN0aW9uIiwicmVzb3VyY2VJZCIsImFjdGlvbk5hbWUiLCJkYXRhIiwiY3JlYXRlZCIsInByZXYiLCJzb3J0IiwiYSIsImIiLCJsb2NhbGVDb21wYXJlIiwiZmlsdGVyZWQiLCJpbmNsdWRlcyIsInNvbWUiLCJjaGlwIiwiYmFja2dyb3VuZENvbG9yIiwicmVtb3ZlQnRuIiwibWFyZ2luQm90dG9tIiwiX2RlZmF1bHQiLCJza2lsbFBpY2tlciIsIlNraWxsUGlja2VyIiwic2tpbGxzIiwic2V0U2tpbGxzIiwiaWRzIiwiZW50cmllcyIsInZhbCIsImVuZHNXaXRoIiwiQm9vbGVhbiIsImJhc2UiLCJ3aW5kb3ciLCJfX0FQSV9CQVNFX18iLCJsb2NhdGlvbiIsInByb3RvY29sIiwiaG9zdG5hbWUiLCJmaW5hbGx5Iiwic2V0TG9hZGluZyIsIngiLCJTZXQiLCJjYXRlZ29yeSIsInRleHRUcmFuc2Zvcm0iLCJsZXR0ZXJTcGFjaW5nIiwib3BhY2l0eSIsInNrIiwidG9nZ2xlIiwibWVkaWFVcGxvYWRlciIsIk1lZGlhVXBsb2FkZXIiLCJhcGlCYXNlIiwidW5kZWZpbmVkIiwiYWx0VGV4dCIsIml0ZW1zIiwic2V0SXRlbXMiLCJpbml0aWFsIiwiZHJhZ2dpbmciLCJzZXREcmFnZ2luZyIsImRyYWdJZHgiLCJmaWxlUmVmIiwibSIsImVycm9yIiwiZmlsZXMiLCJwbGFjZWhvbGRlcnMiLCJBcnJheSIsImZyb20iLCJmIiwiVVJMIiwiY3JlYXRlT2JqZWN0VVJMIiwiRXJyb3IiLCJzdGF0dXMiLCJpZHgiLCJmaW5kSW5kZXgiLCJvbkRyYWdPdmVyIiwibW92ZWQiLCJzcGxpY2UiLCJvbkRyb3Bab25lIiwicHJldmVudERlZmF1bHQiLCJkYXRhVHJhbnNmZXIiLCJ0ZXh0QWxpZ24iLCJ0cmFuc2l0aW9uIiwidmlkZW9NYW5hZ2VyIiwiVmlkZW9NYW5hZ2VyIiwiZGV0ZWN0U291cmNlIiwic291cmNlIiwibmV3VXJsIiwic2V0TmV3VXJsIiwibmV3VGl0bGUiLCJhZGRJdGVtIiwiaXRlbSIsInNldE5ld1RpdGxlIiwibGFiZWxTdHlsZSIsImlucHV0U3R5bGUiLCJ3aWR0aCIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwicGxhY2Vob2xkZXIiLCJvbktleURvd24iLCJhbGlnblNlbGYiLCJkcmFnZ2FibGUiLCJvbkRyYWdTdGFydCIsInBob3RvVXBsb2FkZXIiLCJQaG90b1VwbG9hZGVyIiwiZXhpc3RpbmdVcmwiLCJ1cGRhdGUiLCJwYXRjaCIsIml0IiwidXBsb2FkT25lIiwic3RhdGUiLCJwcm9ncmVzcyIsIlhNTEh0dHBSZXF1ZXN0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ4aHIiLCJ1cGxvYWQiLCJhZGRFdmVudExpc3RlbmVyIiwibGVuZ3RoQ29tcHV0YWJsZSIsImxvYWRlZCIsInRvdGFsIiwiSlNPTiIsInBhcnNlIiwicmVzcG9uc2VUZXh0IiwicmVzdWx0VXJsIiwib3JpZ2luYWxVcmwiLCJvcGVuIiwid2l0aENyZWRlbnRpYWxzIiwic2VuZCIsImFkZEZpbGVzIiwiZmlsZUxpc3QiLCJhbGxvd2VkIiwiTWF0aCIsIm1pbiIsIm5ld0l0ZW1zIiwibG9jYWxVcmwiLCJzdGF0ZUNvbG9yIiwicGVuZGluZyIsImRvbmUiLCJzcmMiLCJhbHQiLCJoZWlnaHQiLCJvYmplY3RGaXQiLCJvbkRyYWdMZWF2ZSIsIm9uRHJvcCIsImNsaWNrIiwiZGFzaGJvYXJkIiwiSU5JVElBTCIsInB1Ymxpc2hlZFBvc3RzIiwiZHJhZnRQb3N0cyIsInByb2plY3RzIiwicGhvdG9zIiwiYWxidW1zIiwiQ0FSRFMiLCJpY29uIiwiYWNjZW50IiwiRGFzaGJvYXJkIiwic3RhdHMiLCJzZXRTdGF0cyIsInNldEVycm9yIiwibG9hZCIsImFsbFBvc3RzUmVzIiwicGhvdG9zUmVzIiwiYWxidW1zUmVzIiwiYWxsU2V0dGxlZCIsInBlclBhZ2UiLCJwdWJQb3N0c1JlcyIsInRvdGFsUG9zdHMiLCJtZXRhIiwicHJvamVjdHNSZXMiLCJEYXRlIiwiZ2V0SG91cnMiLCJob3VyIiwiZ3JlZXRpbmciLCJtYXJnaW5Ub3AiLCJncmlkVGVtcGxhdGVDb2x1bW5zIiwibG9hZGluZyIsIkFkbWluSlMiLCJVc2VyQ29tcG9uZW50cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FPQSxJQUFBLE9BQUFBLE1BQUE7Q0FJQSxFQUFBLENBQUE7Q0FDQSxDQUFBLEVBQUE7Q0FDQUMsTUFBQSxDQUFBQyxjQUFBLENBQUFDLGNBQUEsRUFBQSxZQUFBLEVBQUE7R0FBQUMsS0FBQSxFQUFBO0NBQUEsQ0FBQSxDQUFBO0NBRUEsTUFBQUMsU0FBTSxHQUFBQyxjQUFjLENBQUFDLDJCQUFBLENBQUE7VUFFcEJDLEdBQUlBLENBQUFDLENBQUEsRUFBQTtHQUNKLE9BQUlBLENBQUksQ0FBQUMsT0FBQSxDQUFBLElBQVUsRUFBQSxPQUFBLENBQUEsQ0FBQUEsT0FBQSxDQUFBLElBQUEsRUFBQSxNQUFZLENBQUEsQ0FBQUEsT0FBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUE7O1VBRTlCQyxjQUFBQSxDQUFrQkMsR0FBQSxFQUFLO0NBQ3ZCLEVBQUEsTUFBQUMsS0FBQSxHQUFBLEVBQUE7R0FHQSxJQUFBSixDQUFBLEdBQVFHLEdBQUEsQ0FBQUYsT0FBTyxDQUFBLDJCQUFVLEVBQUEsQ0FBQUksQ0FBQSxFQUFBQyxJQUFBLEVBQUFDLElBQUEsS0FBQTtLQUd6QkgsS0FBUSxDQUFBSSxJQUFPLENBQUEsQ0FBQSxtRkFBQSxFQUFRVCxHQUFBLENBQUFRLElBQUEsQ0FBQUUsSUFBQSxFQUFBLENBQUEs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
