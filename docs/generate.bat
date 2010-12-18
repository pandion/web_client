@cd ..
@echo Generating NaturalDocs
@perl "/NaturalDocs/NaturalDocs" -i "./modules" -i "./core" -o HTML "./docs/out" -p "./docs"
@pause