"""Check exported content and optionally add brochure bookmarks; visual QA is separate."""
from pathlib import Path
from zipfile import ZipFile
import argparse
import json
import re
from lxml import etree
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser()
parser.add_argument('--rendered-docx', required=True, type=Path)
parser.add_argument('--bookmark', action='store_true')
args = parser.parse_args()
source = ROOT / 'local-data/portfolio.json'
if not source.exists():
    source = ROOT / 'data/portfolio.seed.json'
projects = [p for p in json.loads(source.read_text(encoding='utf8'))['projects'] if p['visible']]
inventory = json.loads((ROOT / 'data/repositories.json').read_text(encoding='utf8'))['repositories']
assert {p['github'] for p in projects} == {r['url'] for r in inventory}, 'Export coverage differs from repository inventory'
n = len(projects)
normalize = lambda text: re.sub(r'\s+', '', text)
docx = ROOT / 'output/docx/Kuz_工程项目介绍.docx'
with ZipFile(docx) as archive:
    xml = etree.fromstring(archive.read('word/document.xml'))
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    assert len(xml.xpath('//w:br[@w:type="page"]', namespaces=ns)) == n - 1
    rels = etree.fromstring(archive.read('word/_rels/document.xml.rels'))
    targets = {r.get('Target') for r in rels if r.get('Type', '').endswith('/hyperlink')}
    assert targets == {p['github'] for p in projects}
doc_pdf = PdfReader(args.rendered_docx)
assert len(doc_pdf.pages) == n, f'Expected {n} Word pages, got {len(doc_pdf.pages)}'
for i, (project, page) in enumerate(zip(projects, doc_pdf.pages), 1):
    text = normalize(page.extract_text())
    for key in ['name', 'summary', 'problem', 'solution', 'status']:
        assert normalize(project[key]['zh']) in text, (i, key)
    for label in ['工程名称：', '工程技术栈：', '工程简单描述：', '解决的痛点：']:
        assert label in text, (i, label)

pdf = ROOT / 'output/pdf/Kuz(王煜鹏)_个人宣传手册.pdf'
reader = PdfReader(pdf)
labels = ['个人介绍', '从思考到实现', '项目统计', '能力与方向', '精选项目']
labels += [p['name']['zh'] for p in projects if p['featured']]
labels += [f'全部作品 {i+1:02d} 至 {min(i+6,n):02d}' for i in range(0,n,6)]
labels += ['关于 Kuz', '联系与合作']
assert len(reader.pages) == len(labels), (len(reader.pages), len(labels))
text = normalize(''.join(p.extract_text() for p in reader.pages))
links = set()
for page in reader.pages:
    for ref in page.get('/Annots', []):
        uri = ref.get_object().get('/A', {}).get('/URI')
        if uri:
            links.add(str(uri).rstrip('/'))
for project in projects:
    for key in ['name', 'summary']:
        assert normalize(project[key]['zh']) in text, (project['id'], key)
    assert project['github'].rstrip('/') in links, project['github']
if args.bookmark:
    writer = PdfWriter()
    writer.append(reader, import_outline=False)
    writer.add_metadata({'/Title': 'Kuz 个人宣传手册', '/Author': 'Kuz', '/Subject': f'个人介绍 能力统计 与 {n} 个项目'})
    for i, label in enumerate(labels):
        writer.add_outline_item(label, i)
    with pdf.open('wb') as out:
        writer.write(out)
print(json.dumps({'projects': n, 'wordPages': len(doc_pdf.pages), 'explicitPageBreaks': n-1, 'pdfPages':len(reader.pages), 'githubTargets': len(links), 'contentAndLinks': 'passed'}, ensure_ascii=False))
