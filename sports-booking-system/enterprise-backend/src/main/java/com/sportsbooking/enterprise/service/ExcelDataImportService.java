package com.sportsbooking.enterprise.service;

import com.sportsbooking.enterprise.model.Category;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelDataImportService {

    private final CategoryService categoryService;

    /**
     * Import Categories or Inventory items from Excel file (.xlsx)
     */
    public List<Category> importCategoriesFromExcel(MultipartFile file) throws Exception {
        List<Category> importedList = new ArrayList<>();

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // Skip header row
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Cell nameCell = row.getCell(0);
                if (nameCell == null || nameCell.getCellType() == CellType.BLANK) continue;

                String name = getCellValueAsString(nameCell);
                String slug = row.getCell(1) != null ? getCellValueAsString(row.getCell(1)) : name.toLowerCase().replace(" ", "-");
                String icon = row.getCell(2) != null ? getCellValueAsString(row.getCell(2)) : "sports_soccer";
                String description = row.getCell(3) != null ? getCellValueAsString(row.getCell(3)) : "";
                boolean isActive = row.getCell(4) != null ? getCellValueAsBoolean(row.getCell(4)) : true;
                int order = row.getCell(5) != null ? (int) getCellValueAsNumeric(row.getCell(5)) : i;

                Category category = Category.builder()
                        .name(name)
                        .slug(slug)
                        .icon(icon)
                        .description(description)
                        .isActive(isActive)
                        .displayOrder(order)
                        .build();

                importedList.add(category);
            }
        }

        if (!importedList.isEmpty()) {
            categoryService.batchInsert(importedList);
            log.info("Successfully imported {} categories from Excel via MyBatis batch insert", importedList.size());
        }

        return importedList;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        cell.setCellType(CellType.STRING);
        return cell.getStringCellValue().trim();
    }

    private double getCellValueAsNumeric(Cell cell) {
        if (cell == null) return 0;
        return cell.getNumericCellValue();
    }

    private boolean getCellValueAsBoolean(Cell cell) {
        if (cell == null) return true;
        if (cell.getCellType() == CellType.BOOLEAN) return cell.getBooleanCellValue();
        String val = getCellValueAsString(cell).toLowerCase();
        return val.equals("true") || val.equals("1") || val.equals("active");
    }
}
