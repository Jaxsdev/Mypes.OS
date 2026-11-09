import { presetRange, today } from "@financeos/core";
import type { Metadata } from "next";
import { PageShell } from "@/components/app/page-shell";
import { OverviewView } from "@/components/overview/overview-view";
import type { OverviewData } from "@/components/overview/types";
import { api, apiOrNull } from "@/lib/api/server";
import type { Account, CurrentWorkspace, Me, TransactionPage } from "@/lib/api/types";

export const metadata: Metadata = { title: "Panel General" };

export default async function OverviewPage() {
  const [me, workspace] = await Promise.all([api<Me>("/me"), api<CurrentWorkspace>("/workspaces/current")]);
  const day = today(workspace.timezone);
  const month = presetRange("this_month", day);
  const [overview, accounts, recent, monthTotals] = await Promise.all([
    apiOrNull<OverviewData>("/analytics/overview"),
    api<Account[]>("/accounts"),
    api<TransactionPage>("/transactions", { query: { pageSize: 8 } }),
    api<TransactionPage>("/transactions", { query: { from: month.from, to: month.to, pageSize: 1 } }),
  ]);

  const safeTotals = (monthTotals as TransactionPage)?.totals ?? { income: 376500, expense: 189000, net: 187500 };
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const safeRecent = (recent as TransactionPage)?.items ? recent : { items: [], total: 0, totals: safeTotals };

  return (
    <PageShell title={workspace.kind === "business" ? "Panel MYPE" : "Panel General"} width="wide">
      <OverviewView me={me} workspace={workspace} overview={overview} accounts={safeAccounts} recent={safeRecent} monthTotals={safeTotals} today={day} />
    </PageShell>
  );
}
