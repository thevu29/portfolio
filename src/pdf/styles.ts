import { StyleSheet } from "@react-pdf/renderer";

// Canva lays the CV out at 96 dpi; PDF points are 72 dpi. pt = px * 0.75.
const px = (value: number): number => value * 0.75;

export const PDF_FONT_FAMILY = "IBM Plex Sans";
export const RULE_COLOR = "#916264";
export const LINK_COLOR = "#0000ff";

// react-pdf resolves unitless lineHeight against the style's own fontSize
// (default 18pt), so every text style that sets lineHeight sets fontSize too.
const BODY_SIZE = px(13.33);

// Gaps in Canva px, calibrated against the Canva PDF export: Canva's text
// boxes trim trailing leading, so a few values differ from the editor numbers.
export const gap = {
  nameToTitle: px(3),
  titleToContact: px(6),
  contactToRule: px(8),
  section: px(11),
  headingToContent: px(8),
  companyToRole: px(3),
  item: px(5),
  projectRole: px(7),
  roles: px(5),
  entries: px(16),
} as const;

export const styles = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: BODY_SIZE,
    color: "#000000",
    paddingTop: px(45),
    // Canva lets content run to ~36px from the bottom edge.
    paddingBottom: px(36),
    paddingHorizontal: px(72),
  },
  name: {
    fontSize: px(24),
    fontWeight: 700,
    textAlign: "center",
    textTransform: "uppercase",
    lineHeight: 1.15,
  },
  title: {
    fontSize: px(12),
    textAlign: "center",
    textTransform: "uppercase",
    lineHeight: 1.15,
    marginTop: gap.nameToTitle,
  },
  contact: {
    fontSize: BODY_SIZE,
    textAlign: "center",
    lineHeight: 1.15,
    marginTop: gap.titleToContact,
  },
  link: { color: LINK_COLOR, textDecoration: "none" },
  plainLink: { color: "#000000", textDecoration: "none" },
  rule: {
    marginTop: gap.contactToRule,
    borderBottomWidth: 1,
    borderBottomColor: RULE_COLOR,
  },
  section: { marginTop: gap.section },
  heading: {
    fontSize: px(16),
    fontWeight: 700,
    textAlign: "center",
    textTransform: "uppercase",
    lineHeight: 1.15,
    marginBottom: gap.headingToContent,
  },
  paragraph: { fontSize: BODY_SIZE, lineHeight: 1.5 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  entryTitle: {
    fontSize: px(14.67),
    fontWeight: 700,
    lineHeight: 1.15,
  },
  company: {
    fontSize: px(14.67),
    fontWeight: 700,
    textTransform: "uppercase",
    lineHeight: 1.15,
  },
  roleTitle: {
    fontSize: BODY_SIZE,
    fontWeight: 700,
    textTransform: "uppercase",
    lineHeight: 1.15,
  },
  date: { fontSize: px(13), lineHeight: 1.15 },
  roleLine: { fontSize: BODY_SIZE, lineHeight: 1.15 },
  body: { marginTop: gap.item },
  companyToRole: { marginTop: gap.companyToRole },
  projectRole: { marginTop: gap.projectRole },
  bulletRow: { flexDirection: "row" },
  bulletDot: { width: px(23), paddingLeft: px(6), fontSize: BODY_SIZE, lineHeight: 1.5 },
  bulletText: { flex: 1, fontSize: BODY_SIZE, lineHeight: 1.5 },
  bold: { fontWeight: 700 },
  roleGap: { marginTop: gap.roles },
  entryGap: { marginTop: gap.entries },
});
