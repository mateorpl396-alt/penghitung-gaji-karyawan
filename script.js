"use strict";

const form = document.querySelector("#salary-form");
const errorMessage = document.querySelector("#form-error");
const result = document.querySelector("#salary-result");
const emptyState = document.querySelector("#empty-state");
const periodInput = document.querySelector("#pay-period");

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
});

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatPeriod(value) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" })
    .format(new Date(year, month - 1, 1));
}

function setText(id, value) {
  document.querySelector(`#${id}`).textContent = value;
}

function displaySalary(data) {
  setText("net-salary", rupiah.format(data.net));
  setText("result-period", `Periode ${formatPeriod(data.period)}`);
  setText("result-name", data.name);
  setText("result-role", data.role);
  setText("employee-avatar", data.name.trim().charAt(0).toUpperCase());
  setText("result-base", rupiah.format(data.baseSalary));
  setText("result-allowance", rupiah.format(data.allowance));
  setText("result-overtime", rupiah.format(data.overtime));
  setText("result-bonus", rupiah.format(data.bonus));
  setText("result-deductions", `− ${rupiah.format(data.deductions)}`);
  setText("result-gross", rupiah.format(data.gross));

  setText("slip-period", `Periode gaji: ${formatPeriod(data.period)}`);
  setText("slip-name", data.name);
  setText("slip-role", data.role);
  setText("slip-base", rupiah.format(data.baseSalary));
  setText("slip-allowance", rupiah.format(data.allowance));
  setText("slip-overtime", rupiah.format(data.overtime));
  setText("slip-bonus", rupiah.format(data.bonus));
  setText("slip-gross", rupiah.format(data.gross));
  setText("slip-deductions", `− ${rupiah.format(data.deductions)}`);
  setText("slip-net", rupiah.format(data.net));

  emptyState.hidden = true;
  result.hidden = false;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorMessage.hidden = true;

  if (!form.reportValidity()) return;

  const fields = new FormData(form);
  const name = String(fields.get("name")).trim();
  const role = String(fields.get("role")).trim();
  const period = String(fields.get("period"));
  const baseSalary = Number(fields.get("baseSalary"));
  const allowance = Number(fields.get("allowance") || 0);
  const overtimeHours = Number(fields.get("overtimeHours") || 0);
  const overtimeRate = Number(fields.get("overtimeRate") || 0);
  const tenure = Number(fields.get("tenure") || 0);
  const performance = Number(fields.get("performance") || 1);
  const deductions = Number(fields.get("deductions") || 0);
  const amounts = [baseSalary, allowance, overtimeHours, overtimeRate, tenure, performance, deductions];

  if (!name || !role || amounts.some((amount) => !Number.isFinite(amount) || amount < 0)) {
    errorMessage.textContent = "Periksa kembali data karyawan dan pastikan semua nilai tidak negatif.";
    errorMessage.hidden = false;
    return;
  }

  const overtime = Math.round(overtimeHours * overtimeRate);
  const bonusRate = Math.min(tenure, 10) * 0.01 * (performance / 5);
  const bonus = Math.round(baseSalary * bonusRate);
  const gross = baseSalary + allowance + overtime + bonus;

  displaySalary({
    name,
    role,
    period,
    baseSalary,
    allowance,
    overtime,
    bonus,
    gross,
    deductions,
    net: gross - deductions
  });
});

form.addEventListener("input", () => {
  errorMessage.hidden = true;
});

form.addEventListener("reset", () => {
  errorMessage.hidden = true;
  result.hidden = true;
  emptyState.hidden = false;
  window.setTimeout(() => {
    periodInput.value = currentPeriod();
  });
});

document.querySelector("#print-button").addEventListener("click", () => {
  window.print();
});

periodInput.value = currentPeriod();
