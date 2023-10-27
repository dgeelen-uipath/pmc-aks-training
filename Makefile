FILES := $(shell find . -name '*.yml')
kubectl := /c/source/pmc kubectl pmc-aks-training
DEPLOYED := $(addprefix .deployments/,$(addsuffix .deployed,$(FILES)))

.PHONY: all clean list-resources
all: $(DEPLOYED)
	@echo 'All done!'
	@$(kubectl) get all

.deployments/%.yml.deployed: %.yml
	@mkdir -p $(dir $@)
	@echo "Deploying $<..."
	@$(kubectl) apply -f $<
	@touch $@

list-resources:
	@kubectl api-resources --namespaced=true --output=name \
	| while read resource ; do \
		echo "$${resource}:" ; \
		kubectl \
			get "$${resource}" \
			--namespace daniel-geelen \
		| sed 's/^/	/' \
	; done

clean:
	@rm -rf .deployments/
	@echo "> Cleaning up all resources in namespace 'daniel-geelen'..."
	@kubectl delete all --all --namespace daniel-geelen
