import { create } from "nano-css";
import { addon as addonCache } from "nano-css/addon/cache";
import { addon as addonRule } from "nano-css/addon/rule";
import { addon as addonDrule } from "nano-css/addon/drule";

const nano = create();
addonCache(nano);
addonRule(nano);
addonDrule(nano);
const { rule, drule } = nano;

export { rule, drule };
